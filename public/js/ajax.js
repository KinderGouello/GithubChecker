$(document).ready(function() {
    $.each($('.item'), function(index, repository) {
        $.get('/status/' + $(repository).data('repository'))
            .done(function(data) {
                if (data.status) {
                    $(repository)
                        .addClass('success')
                        .find('.loader')
                        .removeClass('wait')
                        .addClass('check circle');
                    $(repository)
                        .find('.description')
                        .html('Still maintained');
                } else {
                    $(repository)
                        .addClass('fail')
                        .find('.loader')
                        .removeClass('wait')
                        .addClass('remove circle');
                    $(repository)
                        .find('.description')
                        .html('May be deprecated');
                }
            })
            .fail(function(data) {
                $(repository)
                    .addClass('fail')
                    .find('.loader')
                    .removeClass('wait')
                    .addClass('circle');
                $(repository)
                    .find('.description')
                    .html('An error has occurred');
            });
    });
});
