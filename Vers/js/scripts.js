$("#contactForm").submit(function(event){
    event.preventDefault();
    submitForm();
});


function submitForm(){
    var name = $("#name").val();
    var email = $("#email").val();
    var message = $("#message").val();
 
    $.ajax({
        url: "../php/process.php",
        method:'post',
        dataType: 'html',
        data: 
            { name: name ,
            email: email , 
            message:  message},
        success : function(text){
            if (text == "success"){
                formSuccess();
                console.log(text); 
            }
        },
        error: function(xhr, status, error){
                console.log(xhr); 
            }
    });
}
function formSuccess(){
    $( "#msgSubmit" ).removeClass( "d-none" );
}