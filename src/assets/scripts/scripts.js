'use strict';

(function ($) {
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var image = $(document.createElement("img")).attr("src", e.target.result).appendTo("article");
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  function createGrid(width, height) {
    $(".grid .grid__cell").remove();
    var imgWidth = $("article img").outerWidth();
    var imgHeight = $("article img").outerHeight();
    var rows = Math.floor(imgHeight / height);
    var columns = Math.floor(imgWidth / width);

    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < columns; x++) {
        var $span = $(document.createElement("span")).addClass("grid__cell");
        $span.css({
          "top": y * height,
          "left": x * width,
          "width": width,
          "height": height
        });
        $span.appendTo("article .grid");
      }
    }
  }

  $(document).ready(function () {
    $("#sprite").change(function () {
      readURL(this);
    });
    $("#sprite-width, #sprite-height").change(function () {
      var sprWidth = $("#sprite-width").val();
      var sprHeight = $("#sprite-height").val();

      if (sprWidth !== "" && sprHeight !== "") {
        createGrid(sprWidth, sprHeight);
      }
    });
    $(".grid").on("click", ".grid__cell", function () {
      $(this).toggleClass("grid__cell--active");
    });
  });
})(jQuery);
//# sourceMappingURL=scripts.js.map
