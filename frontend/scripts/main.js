import '../style/style.scss';

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
    <h3>Welcome, ${user.username}!</h3>
    <div class="navigation">
    <button class="primary-btn" id="createDocumentInputsBtn">Create Document</button>
      <button class="secondary-btn" id="logoutBtn">Logout</button>
    </div>
    <div id="createDocumentContainer"></div>
    <h3>Documents</h3>
    <div id="documents"></div>
  `;

  const documentsContainer = document.querySelector('#documents');
  fetch(BASE_URL + '/documents/user/' + user.id)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        data.map((doc) => {
          documentsContainer.innerHTML += `
         <div data-id="${doc.id}" class="document">
          <h5>${doc.title}</h5>
          <p>${doc.description}</p>
          <button class="viewDocumentBtn">View</button>
          <button class="editDocumentBtn">Edit</button>
         </div> 
          `;
        });
      }
      printDocumentsEventlisteners();
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
  <h3>New Document</h3>
  <div id="newDocumentMessage"></div>  
    <form action="">
      <input id="newDocumentTitle" type="text" placeholder="Title" maxlength="20">
      <br>
      <textarea id="newDocumentDesc" type="text" placeholder="Description" cols="25" rows="5" maxlength="100"></textarea>
      <br>
      <button class="primary-btn" id="createDocumentBtn">Create</button>
      <button id="cancelCreateDocumentBtn">Cancel</button>
    </form>`;

  const createDocumentBtn = document.querySelector('#createDocumentBtn');
  createDocumentBtn.addEventListener('click', createDocument);

  const cancelCreateDocumentBtn = document.querySelector(
    '#cancelCreateDocumentBtn'
  );
  cancelCreateDocumentBtn.addEventListener('click', printDocuments);
}

async function createDocument(e) {
  e.preventDefault();

  const title = document.querySelector('#newDocumentTitle').value;
  const description = document.querySelector('#newDocumentDesc').value;

  if (title) {
    const doc = { user, title, description };
    fetch(BASE_URL + '/documents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/JSON',
      },
      body: JSON.stringify(doc),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw response.json();
        }
      })
      .then((data) => {
        console.log(data);
        editDocument(data);
      })
      .catch((err) => {
        console.log();
        const newDocumentMessage = document.querySelector(
          '#newDocumentMessage'
        );
        newDocumentMessage.innerHTML = 'The title is already used.';
      });
  } else {
    const messageBox = document.querySelector('#newDocumentMessage');
    messageBox.innerHTML = 'The document needs a title.';
  }
}

function viewDocument(id) {
  fetch(BASE_URL + '/documents/' + id)
    .then((response) => response.json())
    .then((data) => {
      const doc = data[0];

      app.innerHTML = `
        <div class="navigation"> 
          <button id="backBtn">Back</button>
          <button id="deleteBtn" data-id="${doc.id}">Delete</button>
          <button class="primary-btn" id="editBtn" data-id="${
            doc.id
          }">Edit</button>
        </div>
        <div id="deletePopup"></div>
        <div class="viewDocument">
          <h3>${doc.title}</h3>
          <p>${doc.description}</p>
          <hr>
          <div id="document">
            ${doc.value ? doc.value : ''}
          </div>
        </div>
      `;

      const backBtn = document.querySelector('#backBtn');
      backBtn.addEventListener('click', printDocuments);

      const editBtn = document.querySelector('#editBtn');
      editBtn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        editDocument(id);
      });

      const deleteBtn = document.querySelector('#deleteBtn');
      deleteBtn.addEventListener('click', (e) => {
        const docId = e.currentTarget.dataset.id;
        const deletePopup = document.querySelector('#deletePopup');
        deletePopup.innerHTML = `
         <p>Are you sure you want to delete this document?</p>
         <button id="cancelDeleteBtn" data-id="${docId}">Cancel</button>
         <button class="primary-btn" id="deleteDocumentBtn" data-id="${docId}">Delete</button>
        `;
        const deleteBtn = document.querySelector('#deleteDocumentBtn');
        deleteBtn.addEventListener('click', (e) => {
          deleteDocument(e.currentTarget.dataset.id);
        });

        const cancelDeleteBtn = document.querySelector('#cancelDeleteBtn');
        cancelDeleteBtn.addEventListener('click', (e) => {
          viewDocument(e.currentTarget.dataset.id);
        });
      });
    });
}

async function editDocument(id) {
  const documentArray = await fetch(BASE_URL + '/documents/' + id).then(
    (response) => response.json()
  );
  const doc = documentArray[0];

  app.innerHTML = `    
    <div class="navigation">
      <button id="cancelBtn" data-id="${doc.id}">Cancel</button>
      <button class="primary-btn" id="saveBtn" data-id="${doc.id}">Save</button> 
    </div>
    <div class="editDocument">
      <h3>${doc.title}</h3>
      <p>${doc.description}</p>
      <hr>
      <textarea id="myTextArea"></textarea>
    </div>
  `;

  tinymce.init({
    selector: '#myTextArea',
    height: '500',
    toolbar:
      'undo redo | formatselect | fontselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | outdent indent',
    setup: (editor) => {
      editor.on('init', () => {
        editor.setContent(doc.value ? doc.value : '');
        console.log('helllloooooo!!!!!!');
      });
      editor.on('change', () => {
        editor.save();
        console.log('helllloooooo');
      });
    },
  });

  const saveBtn = document.querySelector('#saveBtn');
  saveBtn.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    tinymce.remove('#myTextArea');
    saveDocument(id);
  });

  const cancelBtn = document.querySelector('#cancelBtn');
  cancelBtn.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    tinymce.remove('#myTextArea');
    viewDocument(id);
  });
}

function saveDocument(id) {
  const value = document.querySelector('#myTextArea').value;
  const doc = { id, value };

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

function deleteDocument(id) {
  const deleteItem = { id };
  fetch(BASE_URL + '/documents/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/JSON',
    },
    body: JSON.stringify(deleteItem),
  })
    .then((response) => response.json())
    .then(() => {
      printDocuments();
    });
}

function printLogin() {
  app.innerHTML = `
    <div id="loginCreateUser">
      <div id="loginUser">
        <h4>Login:</h4>
        <div id="loginMessage"></div>
        <form>
          <input type="text" id="loginUsername" placeholder="Username">
          <br>
          <input type="password" id="loginPassword" placeholder="Password">
          <br>
          <button id="loginBtn">Login</button>
        </form>
      </div>
      <div id="createUser">
        <h4>Create user:</h4>
        <div id="createUserMessage"></div>
        <form>
          <input type="text" id="createUserUsername" placeholder="Username">
          <br>
          <input type="password" id="createUserPassword" placeholder="Password">
          <br>
          <button id="createUserBtn">Create</button>
        </form>
      </div>
    </div>
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
  } else {
    document.querySelector('#loginMessage').innerHTML =
      'Fields can not be empty.';
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
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 400) {
          throw response;
        }
      })
      .then((data) => {
        console.log(data);
        document.querySelector('#createUserMessage').innerHTML =
          'User created.';
      })
      .catch((err) => {
        console.log(err);
        document.querySelector('#createUserMessage').innerHTML =
          'Username is unavailable.';
      });
  }
}

function init() {
  checkLogin();
}

init();
