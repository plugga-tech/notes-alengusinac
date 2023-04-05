import '../style.scss';

const app = document.querySelector('#app');
const BASE_URL = 'http://localhost:3000';
let user = JSON.parse(localStorage.getItem('user'));

function checkLogin() {
  user = JSON.parse(localStorage.getItem('user'));

  if (user) {
    printDocuments();
  } else {
    printLogin();
  }
}

function printDocuments() {
  app.innerHTML = `
    <h3>Welcome back, ${user.id}!</h3>
    <button id="logoutBtn">Logout</button>
    <button id="createDocumentInputsBtn">Create Document</button>
    <div id="createDocumentContainer"></div>
    <h3>Documents</h3>
    <div id="documents"></div>
  `;

  const documentsContainer = document.querySelector('#documents');
  fetch(BASE_URL + '/documents/user/' + user.id)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        console.log('hej');
        data.map((doc) => {
          documentsContainer.innerHTML += `
         <div data-id="${doc.id}" class="document">
          <h5>${doc.title}</h5>
          <p>${doc.description}</p>
          <button class="viewDocumentBtn">View</button>
          <button class="editDocumentBtn">Edit</button>
         </div> 
          `;
          printDocumentsEventlisteners();
        });
      }
    });
}

function printDocumentsEventlisteners() {
  const logoutBtn = document.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    checkLogin();
  });

  const createDocumentInputsBtn = document.querySelector(
    '#createDocumentInputsBtn'
  );
  createDocumentInputsBtn.addEventListener('click', printCreateNewDocument);

  const viewDocumentBtns = document.querySelectorAll('.viewDocumentBtn');
  viewDocumentBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const documentId = e.currentTarget.parentElement.dataset.id;
      viewDocument(documentId);
    });
  });

  const editDocumentBtns = document.querySelectorAll('.editDocumentBtn');
  editDocumentBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const documentId = e.currentTarget.parentElement.dataset.id;
      editDocument(documentId);
    });
  });
}

function printCreateNewDocument() {
  const createDocumentContainer = document.querySelector(
    '#createDocumentContainer'
  );

  createDocumentContainer.innerHTML = `    
    <form action="">
      <input id="newDocumentTitle" type="text" placeholder="Title"><br>
      <textarea id="newDocumentDesc" type="text" placeholder="Description" cols="25" rows="5" maxlength="100"></textarea>
      <button id="createDocumentBtn">Create</button>
    </form>`;

  const createDocumentBtn = document.querySelector('#createDocumentBtn');
  createDocumentBtn.addEventListener('click', createDocument);
}

async function createDocument(e) {
  e.preventDefault();

  const title = document.querySelector('#newDocumentTitle').value;
  const description = document.querySelector('#newDocumentDesc').value;

  if (newDocumentTitle) {
    const doc = { user, title, description };
    fetch(BASE_URL + '/documents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(doc),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        editDocument(data);
      });
  }
}

function viewDocument(id) {
  fetch(BASE_URL + '/documents/' + id)
    .then((response) => response.json())
    .then((data) => {
      const doc = data[0];

      app.innerHTML = `
        <button id="backBtn">Back</button> 
        <button id="editBtn" data-id="${doc.id}">Edit</button>
        <h3>${doc.title}</h3>
        <p>${doc.description}</p>
        <hr>
        <div>
          ${doc.value ? doc.value : ''}
        </div>
      `;

      const backBtn = document.querySelector('#backBtn');
      backBtn.addEventListener('click', printDocuments);

      const editBtn = document.querySelector('#editBtn');
      editBtn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        editDocument(id);
      });
    });
}

async function editDocument(id) {
  const documentArray = await fetch(BASE_URL + '/documents/' + id).then(
    (response) => response.json()
  );
  const doc = documentArray[0];

  app.innerHTML = `
  <button id="cancelBtn" data-id="${doc.id}">Cancel</button>
  <button id="saveBtn" data-id="${doc.id}">Save</button> 
   <h3>${doc.title}</h3>
   <p>${doc.description}</p>
   <textarea id="myTextArea"></textarea>
  `;

  tinymce.init({
    selector: '#myTextArea',
    setup: (editor) => {
      editor.on('init', () => {
        editor.setContent(doc.value ? doc.value : '');
      });
      editor.on('change', () => {
        editor.save();
      });
    },
  });

  const saveBtn = document.querySelector('#saveBtn');
  saveBtn.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    saveDocument(id);
  });

  const cancelBtn = document.querySelector('#cancelBtn');
  cancelBtn.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    viewDocument(id);
  });
}

function saveDocument(id) {
  const value = document.querySelector('#myTextArea').value;
  const doc = { id, value };
  console.log(doc);

  fetch(BASE_URL + '/documents/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
    },
    body: JSON.stringify(doc),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.id);
      viewDocument(data.id);
    });
}

function printLogin() {
  app.innerHTML = `
    <h4>Login:</h4>
    <div id="loginMessage"></div>
    <form>
      <input type="text" id="loginUsername" placeholder="Username">
      <input type="password" id="loginPassword" placeholder="Password">
      <button id="loginBtn">Login</button>
    </form>
    <h4>Create user:</h4>
    <div id="createUserMessage"></div>
    <form>
      <input type="text" id="createUserUsername" placeholder="Username">
      <input type="password" id="createUserPassword" placeholder="Password">
      <button id="createUserBtn">Create</button>
    </form>
    `;

  const loginBtn = document.querySelector('#loginBtn');
  loginBtn.addEventListener('click', login);

  const createUserBtn = document.querySelector('#createUserBtn');
  createUserBtn.addEventListener('click', createUser);
}

async function login(e) {
  e.preventDefault();

  const username = document.querySelector('#loginUsername').value;
  const password = document.querySelector('#loginPassword').value;

  if (username && password) {
    const user = { username, password };

    fetch(BASE_URL + '/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.length > 0) {
          localStorage.setItem('user', JSON.stringify(data[0]));
          checkLogin();
        } else {
          document.querySelector('#loginMessage').innerHTML =
            "Username and password don't match.";
        }
      });
  }
}

async function createUser(e) {
  e.preventDefault();

  const username = document.querySelector('#createUserUsername').value;
  const password = document.querySelector('#createUserPassword').value;

  if (username && password) {
    const user = { username, password };

    fetch(BASE_URL + '/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        document.querySelector('#createUserMessage').innerHTML =
          'User created.';
      });
  }
}

function init() {
  checkLogin();
}

init();
