(function() {
  let resizing = false;
  let lastWidth = 0;

  $('.sidebar .btn-expand-collapse').click(function(e) {
    $('.sidebar .hide').toggleClass('hidden');
    resizing = false;
  });

  $(window).on("load resize", function() {
    var viewportWidth = $(window).width();
    let shrinking = lastWidth === 0 || lastWidth > viewportWidth;
    lastWidth = viewportWidth;
    if ($('#btnExpand').hasClass('hidden') && viewportWidth < 600 && shrinking && !resizing) {
      $('.sidebar .hide').toggleClass('hidden');
      resizing = true;
    }
  });
})();