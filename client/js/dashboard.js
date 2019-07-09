(function() {
  let resizing = false;
  let lastWidth = 0;

  $('.mine-dashbar-side .btn-expand-collapse').click(function(e) {
    $('.mine-dashbar-side .hide').toggleClass('cm-hidden');
    resizing = false;
    // HACK For resizing the main content if the mine-dashbar-side is in fixed position
    // $('.mine-content').css('margin-left', $('.mine-dashbar-side').css('width'))
  });

  $(window).on("load resize", function() {
    var viewportWidth = $(window).width();
    let shrinking = lastWidth === 0 || lastWidth > viewportWidth;
    lastWidth = viewportWidth;
    if ($('#btnExpand').hasClass('cm-hidden') && viewportWidth < 600 && shrinking && !resizing) {
      $('.mine-dashbar-side .hide').toggleClass('cm-hidden');
      resizing = true;
    }
    // HACK For resizing the main content if the mine-dashbar-side is in fixed position
    // $('.mine-content').css('margin-left', $('.mine-dashbar-side').css('width'))
  });
})();