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

var scaleDir = 0

$(document).ready(() => {

  //------------------------------------------------------
  // Fade alert messages after 4 seconds or hide on click.
  //------------------------------------------------------
  if ($('.alert')) {
    let delay = $('.alert').html() ? $('.alert').html().length / 100 * 4000 : 4000
    $('.alert').click(() => $('.alert').hide(500));
    setTimeout(() => $('.alert').hide(500), delay); 
  }

  //------------------------------------------------------
  // Setup form specific event handlers.
  //------------------------------------------------------
  if ($('form')) {

    // Add listener to form classes to check if dirty
    $('form').keypress(() => {
      $('#btnView').hide();
    });
    $('form :input').change(() => {
      $('#btnView').hide();
    });
  }

  //------------------------------------------------------
  // Scale text .mine-scale classes for smaller screens
  //------------------------------------------------------
  scaleText();

});

//------------------------------------------------------
// Scale the text on a window resize as well as document load
//------------------------------------------------------
$(window).resize(function () { scaleText() })


//------------------------------------------------------
// HACK to prevent enter key from submitting delete photo form
//------------------------------------------------------
function submitHidden(field) {
  $("form").append(
    '<input type="hidden" name="'+ field + '" value="' + field + '"/>'
  )
  $("form").submit() 
}

//------------------------------------------------------
// Scale font sizes for .mine-scale classes based on screen width
//------------------------------------------------------
const scaleText = function() {
  let curWidth = $('html').width()

  if (curWidth < 576 && scaleDir >= 0) {
    // Scale down once
    $('.mine-scale').map((i, elem) => {
      let curSize = $(elem).css('font-size').match(/\d+/)[0],
          newSize = Math.round(parseInt(curSize) * 0.8)
      $(elem).css('font-size', newSize)
    })
    scaleDir = -1
  } else if (curWidth >= 576 && scaleDir === -1) {
    // Scale up once
    $('.mine-scale').map((i, elem) => {
      let curSize = $(elem).css('font-size').match(/\d+/)[0],
          newSize = Math.round(parseInt(curSize) * (1.0 / 0.8))
      $(elem).css('font-size', newSize)
    })
    scaleDir = 0
  }
}

  