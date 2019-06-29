//------------------------------------------------------
// Performs client-side form validation.
//------------------------------------------------------
(function() {
  'use strict';
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.classList.contains('cm-hidden')) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            $("#spinner").addClass('cm-hidden');
            $('#btnSubmit').removeClass('cm-hidden');
          } else {
            $("#spinner").removeClass('cm-hidden');
            $('#btnSubmit').addClass('cm-hidden');
          }
          form.classList.add('was-validated');
        }
      }, false);
    });
  }, false);
})();


$(document).ready(() => {
  
  //------------------------------------------------------
  // Fade alert messages after 4 seconds or hide on click.
  //------------------------------------------------------
  if ($('.alert')) {
    let delay = $('.alert').html() ? $('.alert').html().length / 100 * 4000 : 4000
    $('.alert').click(() => $('.alert').hide(500));
    setTimeout(() => $('.alert').hide(500), delay); 
  }

  //======================================================
  // Setup form specific event handlers.
  //======================================================
  if ($('form')) {

    //------------------------------------------------------
    // Add listener to form classes to check if dirty
    //------------------------------------------------------
    $('form').keypress(() => {
      $('#btnView').hide();
    });
    $('form :input').change(() => {
      $('#btnView').hide();
    });
  }
});

//------------------------------------------------------
// HACK to prevent enter key from submitting delete photo form
//------------------------------------------------------
function submitHidden(field) {
  $("form").append(
    '<input type="hidden" name="'+ field + '" value="' + field + '"/>'
  )
  $("form").submit() 
}