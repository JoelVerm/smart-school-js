import * as app from './http.js'
import axios from 'axios'
import crypto from 'crypto'
import qs from 'qs'
import { URL } from 'url'
import dotenv from 'dotenv'
dotenv.config()

function base64URLEncode(buffer) {
	return buffer
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')
}
function sha256(str) {
	return crypto.createHash('sha256').update(str).digest()
}
function getCodeVerifierAndChallenge() {
	const codeVerifier = base64URLEncode(crypto.randomBytes(32))
	const codeChallenge = base64URLEncode(sha256(codeVerifier))
	return {
		codeVerifier,
		codeChallenge
	}
}
function getState() {
	return base64URLEncode(crypto.randomBytes(8))
}

app.onGet('/', async (req, res) => {
    res.render('index.html')
})
app.onPost('/login', async (req, res) => {
    let data = await req.getPostData()
    let schools =
		(await axios.get('https://servers.somtoday.nl/organisaties.json')).data[0].instellingen
    let school = schools.find(v => v.naam.includes(data.schoolName))
    if (!school) {
        res.return('error')
        return
    }

    const redirectUri = 'somtodayleerling://oauth/callback'
	const clientId = 'D50E0C06-32D1-4B41-A137-A9A850C892C2'
	const authEndpoint = 'https://inloggen.somtoday.nl/oauth2/authorize'
	const tokenEndpoint = 'https://inloggen.somtoday.nl/oauth2/token'

    const { codeVerifier, codeChallenge } = getCodeVerifierAndChallenge()
	const state = getState()

    try {
        const res = await axios.get(authEndpoint, {
        params: {
            redirect_uri: redirectUri,
            client_id: clientId,
            response_type: "code",
            state: state,
            scope: "openid",
            tenant_uuid: school.uuid,
            session: "no_session",
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        },
        maxRedirects: 0,
        })
    } catch (res) {
        console.log(res)
        const location = new URL(res.response.headers.location)
        const auth = location.searchParams.get("auth")
        try {
        // Submit the login form like someone logged in from a browser
        // This will give a 302 that redirects to the app, which axios thinks is an error, so we catch it
        await axios.post(
            `https://inloggen.somtoday.nl/?-1.-panel-signInForm=&auth=${auth}`,
            qs.stringify({
            loginLink: "x",
            "usernameFieldPanel:usernameFieldPanel_body:usernameField": data.id,
            "passwordFieldPanel:passwordFieldPanel_body:passwordField": data.password,
            }),
            {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                origin: "https://inloggen.somtoday.nl",
            },
            maxRedirects: 0,
            },
        )
        } catch (error) {
        // Get code from callback url
        if (!error.isAxiosError) throw error
        console.log(error)
        const callback = new URL(error.response.headers.location)
        const code = callback.searchParams.get("code")

        // Get access and refresh token from the code
        const tokenRes = await axios.post(
            tokenEndpoint,
            qs.stringify({
            grant_type: "authorization_code",
            code: code,
            code_verifier: codeVerifier,
            client_id: clientId,
            }),
            { headers: { "content-type": "application/x-www-form-urlencoded" } },
        )
        res.return(JSON.stringify(tokenRes.data))
        return
        }
    }
})

let port = process.env.PORT || 80
let server = await app.start(port)
