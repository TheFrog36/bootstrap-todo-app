
const BASE_URL = 'https://628b2f12667aea3a3e290de6.mockapi.io/todos'

let todosArray = [];


function goToTodoPage(id) {
    let urlString = "/todo.html"
    if (id) {
        urlString = urlString + '?id=' + id;
    }
    window.location.href = urlString;
}

// function goToTodoPage2(todo){
//   let urlString = "/todo.html"
//   if (todo) {
//     const todoString = JSON.stringify(todo);
//     sessionStorage.setItem('selectedTodo', todoString);
//   }
//   window.location.href = urlString;
// }

function populateTagContainer(container, tags) {
    for (const tag of tags) {
        const span = document.createElement('span');
        span.classList.add('badge', 'rounded-pill', 'text-bg-dark');
        const node = document.createTextNode('#' + tag);
        span.appendChild(node);
        container.appendChild(span)
    }
}


function createTodoCard(todo) {

    const cardTemplate = `
        <div class="card-header bg-transparent border-dark  d-flex justify-content-between align-items-center">
            #NAME
            <div class="priority-ball" style="background-color: #PRIORITY_COLOR;"></div>
        </div>
        <div class="card-body text-dark " id="tags-container"> </div>
        <div class="card-footer bg-transparent border-dark ">
            <div class="d-flex justify-content-between align-items-center">
                #CREATIONDATE

                <div class="btn-group" role="group" aria-label="Basic example">
                    <button id="delete-button" type="button" class="btn btn-outline-dark "><img src="./assets/delete.svg" height="20"></button>
                    <button id="edit-button" type="button" class="btn btn-outline-dark "><img src="./assets/edit.svg" height="20"></button>
                    <button id="done-button" type="button" class="btn btn-outline-dark "><img src="./assets/check.svg" height="20"></button>
                </div>
            </div>
        </div>`


    const todoHtml = cardTemplate.replace('#NAME', todo.name)
        .replace('#CREATIONDATE', todo.creationDate.toLocaleString())
        .replace('#PRIORITY_COLOR', todo.priority.color)

    return todoHtml;
}

function startLoading() {
    const loader = document.getElementById('loader')
    loader.style.display = 'inline-block'
    const refresh = document.getElementById('refresh-button');
    refresh.style.display = 'none';
}

function stopLoading() {
    const loader = document.getElementById('loader')
    loader.style.display = 'none'
    const refresh = document.getElementById('refresh-button');
    refresh.style.display = 'inline-block';
}

function filterTodos(t1, t2) {
    return t1.id !== t2.id;
}

function removeTodoAndRefesh(todo) {
    stopLoading()
    todosArray = todosArray.filter(t1 => filterTodos(t1, todo))
    displayTodos(todosArray);
}

function deleteTodo(id) {

    startLoading()
    const deleteUrl = BASE_URL + '/' + id;
    const fetchOptions = { method: 'delete' };
    fetch(deleteUrl, fetchOptions)
        .then(response => response.json())
        .then(result => removeTodoAndRefesh(result))
        .catch(error => stopLoading())

}

function requestConfirmToDelete(id) {
    if (confirm('sei pazzo??? potresti pentirtene in futuro...')) {
        deleteTodo(id)
    } else {
        alert('fiu... ci è mancato poco!')
    }
}

function todoDone(todo) {
    todo.doneDate = new Date().getTime() / 1000;
    todo.priority = Todo.PRIORITY.done;
    const dbObj = todo.toDbObj();
    const dbObjJson = JSON.stringify(dbObj);

    const url = BASE_URL + '/' + todo.id;

    fetchOptions = {
        method: 'PUT', body: dbObjJson, headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(url, fetchOptions)
        .then(resp => resp.json())
        .then(res => displayTodos(todosArray))

}

function displayTodos(todos) {

    todosArray.sort(Todo.orderTodoByPriority);
    const todosContainer = document.getElementById('todos-container');

    todosContainer.innerHTML = '';

    for (const todo of todos) {

        const todoCard = document.createElement('div');
        todoCard.classList.add('card', 'border-dark', 'mb-3');

        todoCard.innerHTML = createTodoCard(todo);

        const tagContainer = todoCard.querySelector('#tags-container');

        populateTagContainer(tagContainer, todo.tags)
        const deleteButton = todoCard.querySelector('#delete-button');
        deleteButton.onclick = () => requestConfirmToDelete(todo.id);

        const editButton = todoCard.querySelector('#edit-button');
        if (todo.doneDate) {
          editButton.style.display = 'none';
        } else {
          editButton.onclick = () => goToTodoPage(todo.id);
        }


        const doneButton = todoCard.querySelector('#done-button');
        if (todo.doneDate) {
          doneButton.style.display = 'none';
        } else {
          doneButton.onclick = () => todoDone(todo);
        }
    
        todosContainer.appendChild(todoCard);

    }

}

function initTodos(todos) {
    stopLoading();
    todosArray = todos.map(obj => Todo.fromDbObj(obj));
    displayTodos(todosArray);
}



function loadTodos() {
    startLoading()
    fetch(BASE_URL)
        .then(response => response.json())
        .then(result => initTodos(result))
    //.catch(error => stopLoading())
}

loadTodos()


