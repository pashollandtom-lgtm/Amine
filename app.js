const roomData = {
  chill: { title: 'chill', description: 'pose-toi, t\'es chez toi', icon: '#', kind: 'chat' },
  vocal: { title: 'Vocal chill', description: 'parle en direct avec la commu', icon: '◖))', kind: 'voice' },
  rankup: { title: 'rankup', description: 'on progresse ensemble', icon: '↗', kind: 'topic' },
  swift: { title: 'swift', description: 'des games rapides, zéro pression', icon: 'ϟ', kind: 'topic' },
  admin: { title: 'admin / modo', description: 'salon privé de l’équipe', icon: '♙', kind: 'private' }
};

const initialMessages = [
  { name: 'Luna', initials: 'L', color: 'person-a', time: 'Aujourd’hui à 14:32', text: 'Coucou tout le monde ✨ ça dit quoi ?' },
  { name: 'maxou', initials: 'M', color: 'person-b', time: 'Aujourd’hui à 14:34', text: 'Tranquille, on se fait un swift après ?' },
  { name: 'Nox', initials: 'N', color: 'person-c', time: 'Aujourd’hui à 14:36', text: 'Chaude idée, je finis ma game et j’arrive 🎮' }
];

const trustedSession = window.VALOVOC_SESSION;
const isTeam = trustedSession && ['owner', 'moderator'].includes(trustedSession.role);
const roomContent = document.querySelector('#roomContent');
const composerWrap = document.querySelector('#composerWrap');
const messageInput = document.querySelector('#messageInput');
const toast = document.querySelector('#toast');
let currentRoom = 'chill';
let toastTimer;

// A production server must provide this session after verifying identity and enforce
// room permissions on every API request. Never trust a role saved by the browser.
if (isTeam) {
  document.querySelector('#adminRoomWrap').hidden = false;
  document.querySelector('#profileName').textContent = trustedSession.displayName || 'Équipe';
  document.querySelector('#profileStatus').textContent = trustedSession.role === 'owner' ? 'Propriétaire' : 'Modérateur';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3600);
}

function renderChat() {
  let messages;
  try { messages = JSON.parse(localStorage.getItem('valovoc-demo-messages')) || initialMessages; }
  catch { messages = initialMessages; }
  roomContent.innerHTML = `
    <div class="welcome-block"><div class="welcome-icon">✦</div><p class="welcome-kicker">BIENVENUE DANS</p><h1>#chill</h1><p class="welcome-copy">Le début d’une belle discussion. Dis bonjour à tout le monde 👋</p><div class="welcome-line"></div></div>
    <div class="chat-date"><span></span><small>Aujourd’hui</small><span></span></div>
    <div class="messages" id="messages"></div>`;
  const list = document.querySelector('#messages');
  messages.forEach(message => list.appendChild(makeMessage(message)));
  roomContent.scrollTop = roomContent.scrollHeight;
}

function makeMessage(message) {
  const article = document.createElement('article');
  article.className = 'message';
  const avatar = document.createElement('span');
  avatar.className = `avatar message-avatar ${message.color || 'avatar-me'}`;
  avatar.textContent = message.initials || 'V';
  const body = document.createElement('div'); body.className = 'message-body';
  const meta = document.createElement('div'); meta.className = 'message-meta';
  const name = document.createElement('strong'); name.textContent = message.name;
  const time = document.createElement('time'); time.textContent = message.time;
  const text = document.createElement('p'); text.textContent = message.text;
  meta.append(name, time); body.append(meta, text); article.append(avatar, body);
  return article;
}

function renderRoom(room) {
  currentRoom = room;
  const data = roomData[room];
  document.querySelectorAll('.room-link').forEach(button => {
    const active = button.dataset.room === room;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  document.querySelector('#headerRoom').textContent = data.title;
  document.querySelector('#headerDescription').textContent = data.description;
  document.querySelector('.crumb-hash').textContent = data.icon;
  document.querySelector('.crumb-hash').classList.toggle('special', data.icon !== '#');
  composerWrap.hidden = data.kind !== 'chat';
  if (data.kind === 'chat') { renderChat(); return; }

  if (data.kind === 'private' && !isTeam) {
    roomContent.innerHTML = `<section class="room-state locked-state"><div class="state-icon lock-state-icon">⌑</div><span class="state-kicker">ZONE PRIVÉE</span><h1>Accès réservé</h1><p>Ce salon est uniquement accessible au propriétaire et aux modos désignés. Connecte-toi avec un compte autorisé pour le voir.</p><div class="lock-badge">♙ &nbsp; Salon protégé</div></section>`;
    return;
  }
  if (data.kind === 'voice') {
    roomContent.innerHTML = `<section class="room-state voice-state"><div class="voice-visual"><span class="voice-wave wave-left">)))</span><div class="voice-big-icon">◖))</div><span class="voice-wave wave-right">(((</span></div><span class="state-kicker">VOCAL DE LA COMMU</span><h1>Vocal chill</h1><p>Retrouve les autres en vocal et partage un moment tranquille.</p><div class="voice-members"><span class="avatar person-a">L</span><span class="avatar person-b">M</span><span class="avatar person-c">N</span><span class="voice-member-count">3 personnes dans le salon</span></div><button class="primary-button" id="joinVoice">◖)) &nbsp; Rejoindre le vocal</button><span class="voice-disclaimer">Le vocal temps réel n’est pas encore connecté.</span></section>`;
    document.querySelector('#joinVoice').addEventListener('click', () => showToast('Le vocal nécessite un serveur WebRTC et une connexion membre. Cette démo ne transmet pas ton micro.'));
    return;
  }
  const isRank = room === 'rankup';
  roomContent.innerHTML = `<section class="room-state topic-state"><div class="topic-icon ${isRank ? 'rank-topic' : 'swift-topic'}">${data.icon}</div><span class="state-kicker">${isRank ? 'ON MONTE ENSEMBLE' : 'PARTIES DÉTENTE'}</span><h1>${data.title}</h1><p>${isRank ? 'Trouve des mates, partage tes objectifs et progresse à ton rythme. Bonne humeur avant tout !' : 'Une petite partie rapide ? Trouve des joueurs et lance un swift sans pression.'}</p><div class="topic-card"><span class="topic-card-icon">${isRank ? '✧' : '⚡'}</span><div><strong>${isRank ? 'À la recherche de mates ?' : 'Prêt pour une partie ?'}</strong><span>${isRank ? 'Présente ton rang et tes dispos dans le chat.' : 'Passe dans le vocal chill pour trouver ta team.'}</span></div><span class="topic-arrow">↗</span></div><button class="secondary-button" data-back-chat>← &nbsp; Retour au chill</button></section>`;
  roomContent.querySelector('[data-back-chat]').addEventListener('click', () => renderRoom('chill'));
}

document.querySelectorAll('.room-link').forEach(button => button.addEventListener('click', () => {
  const room = button.dataset.room;
  if (room === 'admin' && !isTeam) {
    renderRoom('admin');
    document.querySelector('#sidebar').classList.remove('open');
    return;
  }
  renderRoom(room);
  document.querySelector('#sidebar').classList.remove('open');
}));

document.querySelector('#messageForm').addEventListener('submit', event => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  const message = { name: 'Toi', initials: 'V', color: 'avatar-me', time: 'à l’instant', text };
  let messages;
  try { messages = JSON.parse(localStorage.getItem('valovoc-demo-messages')) || initialMessages; }
  catch { messages = initialMessages; }
  messages.push(message);
  localStorage.setItem('valovoc-demo-messages', JSON.stringify(messages.slice(-60)));
  document.querySelector('#messages').appendChild(makeMessage(message));
  messageInput.value = '';
  roomContent.scrollTop = roomContent.scrollHeight;
  showToast('Message enregistré uniquement sur cet appareil.');
});

document.querySelector('#emojiButton').addEventListener('click', () => {
  messageInput.value += ' ✨'; messageInput.focus();
});

document.querySelector('#mobileMenu').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
const modal = document.querySelector('#modalBackdrop');
function openModal() { modal.hidden = false; document.querySelector('#modalOk').focus(); }
function closeModal() { modal.hidden = true; }
document.querySelector('#helpButton').addEventListener('click', openModal);
document.querySelector('#infoButton').addEventListener('click', openModal);
document.querySelector('#profileButton').addEventListener('click', () => showToast('La connexion membre sera disponible avec le serveur Valovoc.'));
document.querySelector('#modalClose').addEventListener('click', closeModal);
document.querySelector('#modalOk').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

renderRoom('chill');
