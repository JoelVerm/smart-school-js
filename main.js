import * as app from './http.js'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()


app.onGet('/', async (req, res) => {
    res.render('index.html')
})
app.onPost('/startSSO', async (req, res) => {
    let schoolName = (await req.getPostData()).schoolName
    let schools = (
		await axios.get('https://servers.somtoday.nl/organisaties.json')
	).data[0].instellingen
	let school = schools.find(v => v.naam.includes(schoolName))
	if (!school) {
		res.return('error: school not found: ' + schoolName)
		return
	}
    let href = `https://somtoday.nl/oauth2/authorize?redirect_uri=somtodayleerling%3A%2F%2Foauth%2Fcallback&client_id=D50E0C06-32D1-4B41-A137-A9A850C892C2&response_type=code&prompt=login&state=UNlYiXONB69K8uNwNJ2rCw&scope=openid&code_challenge=F8ZMiSrb3ysna7ClO5W2o_78tNla6qxm_aOPeRtIJWQ&code_challenge_method=S256&tenant_uuid=${school.uuid}&oidc_iss=${school.oidcurls[0].url}&session=no_session`
    res.redirect(href)
})
app.onPost('/loginLinkSubmit', async (req, res) => {
	let link = (await req.getPostData()).link
	let code = new URL(link).searchParams.get('code')
	let loginData = await axios.post(
		'https://inloggen.somtoday.nl/oauth2/token',
		new URLSearchParams({
			grant_type: 'authorization_code',
			code: code,
			code_verifier: 'DI_RqEBWaVebKZMZCQ02oChis7HbTCqSk7vZU9hiDg8',
			client_id: 'D50E0C06-32D1-4B41-A137-A9A850C892C2'
		}).toString(),
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		}
	).catch(console.error)
	res.render('loginLinkSubmit.html', {
		api_url: loginData.data.somtoday_api_url,
		access_token: loginData.data.access_token,
		refresh_token: loginData.data.refresh_token,
		id_token: loginData.data.id_token
	})
})

let port = process.env.PORT || 80
let server = await app.start(port)
