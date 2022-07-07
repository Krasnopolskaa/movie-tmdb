$(function() {

    let API = "https://api.themoviedb.org/3";
    let KEY = "b9453a5d4bc4d4b930624c6d809fca9c";
    let URL_IMAGE = "http://image.tmdb.org/t/p/";
    let BACKDROP = URL_IMAGE + "original";
    let POSTER = URL_IMAGE + "w500";
    
    let getMovies = API + "/discover/movie" + "?api_key=" + KEY + "&language=en-US";
    let getTopRated = API + "/discover/tv" + "?api_key=" + KEY + "&language=en-US";
    let getUpcoming = getMovies + "&with_genres=10751";

    $.ajax(getMovies).done(function(res){
        mountFeatured(res.results);  
        res.results.shift();
        mountCarousel(res.results, "#movies-slider");
    });

    $.ajax(getTopRated).done(function(res){
        mountCarousel(res.results, "#rated-slider");
    });

    $.ajax(getUpcoming).done(function(res){
        mountCarousel(res.results, "#upcoming-slider");
    });


    $(".movies-list__slider").slick({
        variableWidth: true,
        prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>'
    });

    $("#play-featured, .movies-list__slider").click(function(e) {
        let idMedia, type;

        if ($(this).data("id")) {
            idMedia = $(this).data("id");
            type = $(this).data("type");
        } else {
            idMedia = $(e.target).closest("[data-id]").data("id");
            type = $(e.target).closest("[data-type]").data("type");
        };

        if (idMedia) {
            $("#modal").fadeIn();
            setTimeout(function() {
                $("#wrap").addClass("blur");
            }, 200)
            $("body").css("overflow", "hidden")
    
            $.ajax(API + "/" + type + "/" + idMedia + "?api_key=" + KEY + "&language=en-US")
                .done(function(res){
                    mountModal(res);
            });
        };
    });

    $("#close-modal").click(function() {
        $("#modal").fadeOut();
        setTimeout(function() {
            $("#wrap").removeClass("blur");
        }, 200)
        $("body").css("overflow", "auto")
    });

    $("#modal .modal__poster").click(function(res) {

        let type = $(this).attr("data-type");
        let id = $(this).attr("data-id");

        $.ajax(API + "/" + type + "/" + id + "/videos?api_key=" + KEY + "&language=en-US")
            .done(function(res) {
                $("#player").fadeIn();
                if (res.results[0]) {
                    console.log(res.results.length);
                    let idVideo = res.results[0].key;
                    
                    let video = '<iframe src="https://www.youtube.com/embed/' + idVideo + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    
                    $("#player .player-content").html(video);
                    $("#player iframe").css("width", window.innerWidth).css("height", window.innerHeight);
                } else {
                    $("#player .player-content").html("<h3>Video unavailable :(</h3>");
                    console.log(res.results[0]);
                }
            });
    });

    $("#close-player").click(function() {
        $("#player").fadeOut();
    });    
    
    window.addEventListener("resize", function() {
        $("#player iframe").css("width", window.innerWidth).css("height", window.innerHeight);
    });

    $(document).ajaxComplete(function(){
        setTimeout(function(){
            $("#loading").fadeOut();
        }, 300)
    });

    $(document).ajaxStart(function(){
        $("#loading").fadeIn();
    });

    function mountFeatured(movies) {
        let featured = movies[0];
        let title = featured.title;
        let vote = featured.vote_average;
        let backdrop = BACKDROP + featured.backdrop_path;
        let id = featured.id;
        
        $("#backdrop").css("background-image", "url("+backdrop+")");
        $("#featured-title").text(title);
        $("#featured-vote").text(vote);
        $("#play-featured").attr("data-id", id).attr("data-type", "movie");
    };

    function mountCarousel(list, slider) {
        list.forEach(function(item) {
            let title = item.title ? item.title : item.name;
            let poster = POSTER + item.poster_path;
            let vote = item.vote_average;
            let id = item.id;
            let type = item.name ? "tv" : "movie";

            let template = '<div class="movies-list__item" data-id='+id+' data-type='+type+'>';
                template += '<img src="' + poster + '">';
                template += '<div class="movies-list__action">';
                template += '<i class="far fa-play-circle"></i>';
                template += '<h3>' + title + '</h3>';
                template += '<div class="rating">';
                template += '<div class="rating__score">'+ vote +'</div>';
                template += '</div>';
                template += '</div>';
                template += '</div>';

            $(slider).slick("slickAdd", template);
        });
    };

    function mountModal(media) {

        let isTv = !!media.name;
        let poster = POSTER + media.poster_path;
        let title = isTv ? media.name : media.title;
        let original_title = isTv ? "" : media.original_title
        let overview = media.overview;
        let vote = media.vote_average;
        let runtime = isTv ? media.number_of_seasons+" temporada(s)" : media.runtime+" min";
        let homepage = media.homepage;
        let iconRuntime = isTv ? "fas fa-tv" : "far fa-clock"; 
        let id = media.id;

        $("#modal .modal__poster").attr("data-id", id).attr("data-type", isTv ? "tv" : "movie");
        $("#modal .modal__poster img").attr("src", poster);
        $("#modal h2").html(title);
        $("#modal h4").html(original_title);
        $("#modal p").html(overview);
        $("#modal .rating__score").html(vote);
        $("#modal .modal__runtime span").html(runtime);
        $("#modal .modal__runtime i").removeClass().addClass(iconRuntime);
        $("#modal a").html(homepage).attr("href", homepage);
    };
});