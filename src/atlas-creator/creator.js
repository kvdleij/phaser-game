'use strict';

(function ($) {
    function readURL(input) {

        if (input.files && input.files[0]) {
            let reader = new FileReader();

            reader.onload = function (e) {
                let image = $(document.createElement("img")).attr("src", e.target.result).appendTo("article");
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    function createGrid(width, height) {
        $(".grid .grid__cell").remove();
        let imgWidth = $("article img").outerWidth();
        let imgHeight = $("article img").outerHeight();

        let rows = Math.floor(imgHeight / height);
        let columns = Math.floor(imgWidth / width);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                let $span = $(document.createElement("span")).addClass("grid__cell");
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
            let sprWidth = $("#sprite-width").val();
            let sprHeight = $("#sprite-height").val();

            if (sprWidth !== "" && sprHeight !== "") {
                createGrid(sprWidth, sprHeight);
            }
        });

        $(".grid").on("click", ".grid__cell", function(){
            $(this).toggleClass("grid__cell--active");
        });
    });

})(jQuery);
