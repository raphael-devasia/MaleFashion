
  const cform = document.getElementById("cform")
cform.addEventListener("submit", (event) => {
    event.preventDefault()
    console.log("begin validation");
    const name = document.getElementById("editfirstName")
    const user = document.getElementById("edituserName")
    const phone = document.getElementById("editphoneNumber")
    const email = document.getElementById("editemailAddress")
    const password = document.getElementById("editpassword")
    const emailRegex =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/



        
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        const userNamePattern =
            /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
        const phonePattern =
            /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
        const namePattern = /^[A-Za-z]+(?: [A-Za-z]+)+$/

    if (name.value.trim() == "") {
        alert("Name can't be blank")

    } else if (!emailRegex.test(email.value)) {
        alert("Enter a valid email")
    } 
    else if (!passwordPattern.test(password.value)) {
        alert("Enter a valid password")
    }
     else if (!userNamePattern.test(user.value)) {
         alert("Enter a valid username")
     } else if (!phonePattern.test(phone.value)) {
         alert("Enter a valid phone number")
     } else {
         cform.submit()
         cform.reset()
         console.log("end validation");
         // var messageElement = document.getElementsByClassName("loading")
         // messageElement.style.display = "block"
         // // Hide the message after 4 seconds
         // setTimeout(function () {
         //     messageElement.style.display = "none"
         // }, 4000) // 4 seconds (4000 milliseconds)
     }
})
