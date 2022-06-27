import { MouseListener } from './mouse.js'
new MouseListener(document.querySelector('#menu-todo')).onDown(() => {
	document.querySelector('#wrapper').style.left = '0px'
})
new MouseListener(document.querySelector('#menu-home')).onDown(() => {
	document.querySelector('#wrapper').style.left = '-100vw'
})

async function init() {
	let loginInfo = sessionStorage.getItem('loginInfo')
	if (!loginInfo) {
		location.href = '/login'
		return
	}
	document.querySelector('#login').style.display = 'none'
	loginInfo = JSON.parse(loginInfo)
}
window.onload = init
