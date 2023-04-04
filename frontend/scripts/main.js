import '../style.scss';

const app = document.querySelector('#app');
const BASE_URL = 'http://localhost:3000';
let user = JSON.parse(localStorage.getItem('user'));

tinymce.init({
  selector: '#myTextArea',
});

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
    <button id="createDocumentInputsBtn">Create Document</button>
    <button id="logoutBtn">Logout</button>
    <div id="createDocumentContainer"></div>
    <h3>Documents</h3>
    <div id="documents"></div>
  `;

  const documentsContainer = document.querySelector('#documents');
  fetch(BASE_URL + '/documents/' + user.id)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        console.log('hej');
        data.map((doc) => {
          documentsContainer.innerHTML += `
         <div data-id="${doc.id}" class="document">
          <h5>${doc.title}</h5>
          <p>${doc.description}</p>
          <button>View</button>
          <button>Edit</button>
         </div> 
          `;
        });
      }
    });

  const logoutBtn = document.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    checkLogin();
  });

  const createDocumentInputsBtn = document.querySelector(
    '#createDocumentInputsBtn'
  );
  createDocumentInputsBtn.addEventListener('click', printCreateNewDocument);
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
    const document = { user, title, description };
    fetch(BASE_URL + '/documents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(document),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        editDocument(data);
      });
  }
}

function editDocument(id) {
  printDocuments();
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
