import { MouseListener } from './mouse.js'
new MouseListener(document.querySelector('#menu-todo')).onDown(() => {
	document.querySelector('#wrapper').style.left = '0px'
})
new MouseListener(document.querySelector('#menu-home')).onDown(() => {
	document.querySelector('#wrapper').style.left = '-100vw'
})

function init() {
	let loginInfo = sessionStorage.getItem('loginInfo')
	if (!loginInfo) return
	document.querySelector('#login').style.display = 'none'
	loginInfo = JSON.parse(loginInfo)

	let loginStatus = fetch('/login', {
		method: 'POST',
		body: new URLSearchParams(loginInfo).toString()
	})
	console.log(loginStatus)
	if (loginStatus === 'error') {
		sessionStorage.setItem('loginInfo', '')
		location.href = location.href
	}
}
window.onload = init

document.querySelector('#login-submit').addEventListener('click', () => {
	let loginInfo = {
		schoolName: document.querySelector('#login-schoolName').value,
		id: document.querySelector('#login-id').value,
		password: document.querySelector('#login-password').value
	}
	sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo))
	init()
})
