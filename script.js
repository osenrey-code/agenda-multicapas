const API_URL = 'http://www.raydelto.org/agenda.php';

const form = document.querySelector('#contact-form');
const nombreInput = document.querySelector('#nombre');
const apellidoInput = document.querySelector('#apellido');
const telefonoInput = document.querySelector('#telefono');
const saveButton = document.querySelector('#save-button');
const refreshButton = document.querySelector('#refresh-button');
const formMessage = document.querySelector('#form-message');
const loading = document.querySelector('#loading');
const contactsList = document.querySelector('#contacts-list');
const emptyState = document.querySelector('#empty-state');

document.addEventListener('DOMContentLoaded', loadContacts);
refreshButton.addEventListener('click', loadContacts);
form.addEventListener('submit', saveContact);

async function loadContacts(options = {}) {
  setLoading(true);

  if (!options.keepMessage) {
    clearMessage();
  }

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('No se pudo obtener el listado de contactos.');
    }

    const contacts = await response.json();
    renderContacts(Array.isArray(contacts) ? contacts : []);
  } catch (error) {
    contactsList.innerHTML = '';
    emptyState.hidden = false;
    showMessage('No fue posible cargar la agenda. Verifica tu conexion o intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

async function saveContact(event) {
  event.preventDefault();
  clearMessage();

  const contact = {
    nombre: nombreInput.value.trim(),
    apellido: apellidoInput.value.trim(),
    telefono: telefonoInput.value.trim()
  };

  if (!contact.nombre || !contact.apellido || !contact.telefono) {
    showMessage('Completa todos los campos antes de guardar.', 'error');
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = 'Guardando...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!response.ok) {
      throw new Error('No se pudo guardar el contacto.');
    }

    form.reset();
    showMessage('Contacto guardado correctamente.', 'success');
    await loadContacts({ keepMessage: true });
  } catch (error) {
    showMessage('No fue posible guardar el contacto. Intenta de nuevo.', 'error');
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Guardar contacto';
  }
}

function renderContacts(contacts) {
  contactsList.innerHTML = '';
  emptyState.hidden = contacts.length > 0;

  const fragment = document.createDocumentFragment();

  contacts.forEach((contact) => {
    const card = document.createElement('article');
    card.className = 'contact-card';

    const info = document.createElement('div');
    const fullName = document.createElement('h3');
    const phoneLabel = document.createElement('p');
    const phone = document.createElement('span');

    fullName.textContent = `${contact.nombre || ''} ${contact.apellido || ''}`.trim() || 'Sin nombre';
    phoneLabel.textContent = 'Telefono';
    phone.className = 'phone-pill';
    phone.textContent = contact.telefono || 'No registrado';

    info.append(fullName, phoneLabel);
    card.append(info, phone);
    fragment.appendChild(card);
  });

  contactsList.appendChild(fragment);
}

function setLoading(isLoading) {
  loading.hidden = !isLoading;
  refreshButton.disabled = isLoading;
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`;
}

function clearMessage() {
  formMessage.textContent = '';
  formMessage.className = 'message';
}
