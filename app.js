const toggleButton = document.getElementById('toggle-btn')
const sideBar = document.getElementById('sidebar')

function toggleSidebar() {
    sideBar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
}