var ejs = require('ejs');
var socket = io.connect();
var tios = tios || {};

tios.updateRecent = function() {
  var recent = JSON.parse($.cookie('recent')) || [];
  var update = [];
  for (var i = 0; i < recent.length; i++) {
    if (recent[i].stop_id !== tios.stop_id) {
      update.push(recent[i]);
    }
  }
  update.unshift({ stop_id: tios.stop_id, stop_desc: tios.stop_desc });
  tios.recent = update.slice(0, 5); // Max 5.
  $.cookie('recent', JSON.stringify(tios.recent), { expires: 90, path: '/' });
}
tios.updateRecent();

tios.identity = JSON.parse($.cookie('identity')) || {count: 0, nickname: null };

function checkIdentity() {
  if (tios.identity.count === 3) {
    $('#identity').html('<div id="nickname"><label>Nickname</label><input id="nickname" type="text" /></div>');
  }
  if (tios.identity.count > 3 && tios.identity.nickname != '') {
    $('#identity').html('<div id="nickname"><label>Nickname:</label> ' + tios.identity.nickname + '<input id="nickname" type="hidden" value="' + tios.identity.nickname + '" /></div>');
  }
}
checkIdentity();

function incrementIdentity() {
  tios.identity.count++;
  $.cookie('identity', JSON.stringify(tios.identity), { expires: 90, path: '/' });
  checkIdentity();
}

function saveIdentity(nickname) {
  tios.identity.nickname = nickname;
  $.cookie('identity', JSON.stringify(tios.identity), { expires: 90, path: '/' });
}

// Update timestamps every 15 seconds.
window.setInterval(function() {
  $('.comment .time').each(function(index) {
    $(this).html(tios.prettyDate($(this).attr('data-time')));
  });
}, 15000);

/*
 * Based on John Resig's Pretty Date: http://ejohn.org/blog/javascript-pretty-date/
 * Licensed under the MIT and GPL licenses.
 *
 * Takes an ISO time and returns a string representing how
 * long ago the date represents.
 */
tios.prettyDate = function(time) {
  var date = new Date(time),
      diff = (((new Date()).getTime() - date.getTime()) / 1000),
      day_diff = Math.floor(diff / 86400);

  if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
    return;

  return day_diff == 0 && (
      diff < 60 && "Just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
};

ejs.filters.time = function(milliseconds) {
  return tios.prettyDate(milliseconds);
};

tios.commentTemplate = ejs.compile($('#comment-template').html());

tios.actionsHandler = function(evt) {
  var el = $(this);
  // If report button, show confirmation step.
  if (!el.hasClass('report') || confirm('Are you sure you want to report this comment?')) {
    $.get(el.attr('href'), function(data) {
      var newComment = $(tios.commentTemplate({ comment: data.comment, new_comment: true }));
      $('.actions a', newComment).click(tios.actionsHandler);
      el.parents('.comment').replaceWith(newComment);
    });
  }
  return false;
}
$('.comment .actions a').click(tios.actionsHandler);

tios.insertComment = function(data) {
  var comment = data.comment;
  // if data.error === true then prepend to comment form with data.message
  var newComment = $(tios.commentTemplate({ comment: comment, new_comment: true })).hide();
  $('.actions a', newComment).click(tios.actionsHandler);
  $('#comments').prepend(newComment);
  newComment.slideDown();
}

socket.on('stop/' + tios.stop_id, tios.insertComment);

// http://api.jquery.com/focusin/ for showing when something is typing.

$('#new-comment').submit(function() {
    var types = {};
    $.each($("#new-comment input:checked"), function() {
      var val = $(this).val();
      types[val] = 'on';
    });
    socket.emit('new', {
      comment : $('#new-comment textarea').val(),
      stop: tios.stop_id,
      types: types,
      nickname: $('#identity #nickname').val() || null
    });
    $('#new-comment textarea').val('');
    $('#new-comment .category').removeClass('active');
    $('#new-comment input[type=checkbox]').attr('checked', false);
    incrementIdentity();
    if ($('#identity #nickname').length > 0) {
      saveIdentity($('#identity #nickname').val());
      checkIdentity();
    }

    /*
    $.post($(this).attr('action'), $(this).serialize(), function(data) {
      if (data.error === false) {
        $('#new-comment textarea').val('');
        $('#new-comment .category').removeClass('active');
        $('#new-comment input[type=checkbox]').attr('checked', false);

        // If socket not connected, take care of insertion.
        if (socket.socket.connected !== true) {
          insertComment(data);
        }
      }
    });
    */
    return false;
});

$('textarea#text').focus(function() {
  $(this).html('');
}).keyup(function() {
  $('#count').html(200 - $(this).val().length);
});

// Also look at: http://cubiq.org/remove-onclick-delay-on-webkit-for-iphone
// And: http://code.google.com/mobile/articles/fast_buttons.html
$('#new-comment .category').toggle(function() {
  $(this).addClass('active');
  $('#new-comment input[name="type[' + $(this).attr('id') + ']"]').attr('checked', true);
}, function() {
  $(this).removeClass('active');
  $('#new-comment input[name="type[' + $(this).attr('id') + ']"]').attr('checked', false);
});

$('header .btn').hide();

$('#another-stop, #stop_id').click(function() {
  $('#stop_id').hide();
  $('#stop_form').show();
  $('#stop').focus();
  window.scrollTo(0,0);
  return false;
});

$('#stop').keyup(function() {
  if ($(this).val().length >= 5) {
    $('#stop_form').submit();
    $(this).unbind();
  }
});

$('#third-party').click(function() {
  $('#marker').toggleClass('active');
  $('#third-party, #map-overlay').toggleClass('active');
});
