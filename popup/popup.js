$(document).ready(function () {
    $('.main-music-container, .main-video-container').hide();

    // Toast message function
    function showToast(message, isSuccess = false) {
        const toast = $('<div class="toast" data-aos="fade-left"></div>').text(message);

        if (isSuccess) {
            toast.addClass('success');
        }

        $('body').append(toast);

        // Show the toast
        setTimeout(() => toast.css('opacity', 1), 10);

        // Hide the toast after 3 seconds
        setTimeout(() => {
            toast.css('opacity', 0);
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Handle Start button
    $('#start').on('click', function () {
        const url = $('#search-url').val().trim();

        if (!url) {
            showToast('Please enter a YouTube URL');
            return;
        }

        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            showToast('Invalid YouTube link');
            return;
        }

        // Show music/video choice section
        $('#active').show();
        $('#start').hide();
    });

    // Handle Music option click
    $('.music').on('click', function () {
        $('.home-container').hide();
        $('.main-video-container').hide();
        $('.main-music-container').show();
    });

    // Handle Video option click
    $('.video').on('click', function () {
        $('.home-container').hide();
        $('.main-music-container').hide();
        $('.main-video-container').show();
    });

    // Handle return back
    $('#a-return-back').on('click', function () {
        $('.home-container').show();
        $('.main-music-container').hide();
    });
    $('#v-return-back').on('click', function () {
        $('.home-container').show();
        $('.main-video-container').hide();
    });

    // Handle MP3 format download
    $('.main-music-container .formates button').on('click', function () {
        const videoUrl = $('#search-url').val().trim();
        if (videoUrl) {
            showToast(`Simulating MP3 download`, true);
            // Actual MP3 download logic here
        }
    });

    // Handle MP4 format download
    $('.main-video-container .formates button').on('click', function () {
        const videoUrl = $('#search-url').val().trim();
        if (videoUrl) {
            showToast(`Simulating MP4 download`, true);
            // Actual MP4 download logic here
        }
    });
});
