function Login(){
    console.log("Login was called")
    emailFieldValue = document.getElementById("EmailField").value;
    passwordFieldValue = document.getElementById("PasswordField").value;

    body = JSON.stringify({
    	"Email" : emailFieldValue,
    	"Password" : passwordFieldValue
    });

    SendLoginInfo("http://localhost:5000/login", body)
}

function SendLoginInfo(url, body){
	var request = new XMLHttpRequest();

	if (request == undefined){
		console.log("I was not able to create the request");
	}
	request.withCredentials = true;
	request.open('POST', url, true)
	request.setRequestHeader("Content-Type", "application/json");

	request.onload = function(){
		if(this.status == 404){
			console.log("Invalid User and Password information. Please check your login information.");
		}
		else{
			console.log(this.response);
			window.location.replace(this.response);
		}
	}

	request.send(body);
}
