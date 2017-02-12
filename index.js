

alert("It works");

*/
firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
	if (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		window.alert(error.message);
	} else {
		alert("It worked!")

	}
});

/*