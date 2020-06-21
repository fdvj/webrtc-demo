/**
 * Renders a list of clients in the provided list element
 * @param {HTMLUListElement} userList - The UL element to attach the list
 * @param {string[]} clients - List of clients to be rendered
 * @param {string | undefined} currentUser - The username of the current user
 * @param {EventListener} callEventListener - The event listener to be attached to the call button
 */
function renderUserList(userList, clients, currentUser, callEventListener) {
  clearUserList(userList, callEventListener);
  clients.forEach((user) => {
    userList.appendChild(renderSingleUser(user, currentUser, callEventListener));
  });
}

exports.renderUserList = renderUserList;

/**
 * Renders a single user element in the list
 * @param {string} user - The user for which to create the list item
 * @param {string | undefined} currentUser - The current username
 * @param {EventListener} callEventListener - The onclick event handler
 * @returns {HTMLLIElement} User with call button
 */
function renderSingleUser(user, currentUser, callEventListener) {
  const container = document.createElement('li');
  
  const username = document.createElement('div');
  username.className = 'username';
  username.innerText = user;
  container.appendChild(username);

  if (currentUser && currentUser !== user) {
    const button = document.createElement('button');
    button.className = 'call';
    button.value = user;
    button.innerText = 'Call';
    button.addEventListener('click', callEventListener);
    container.appendChild(button);
  }

  return container;
}

/**
 * Removes all event listeners from the call buttons
 * @param {HTMLUListElement} userList - The list to be cleared
 * @param {EventListener} callEventListener - The event listeners to be detached
 */
function clearUserList(userList, callEventListener) {
  document.querySelectorAll('.call').forEach((node) => {
    node.removeEventListener('click', callEventListener);
  });
  Array.from(userList.children).forEach((child) => child.remove());
}