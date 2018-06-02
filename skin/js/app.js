'use strict';

let formatter = new Intl.NumberFormat(),
    $document = $(document),
    $window = $(window);

let flexCarTableFlag = window.location.pathname.indexOf('index-grid') == '-1' ? true : false;

$(function() {
  svg4everybody();
  $('.select-base').fancySelect();

  fetch('https://rawgit.com/Varinetz/e6cbadec972e76a340c41a65fcc2a6b3/raw/90191826a3bac2ff0761040ed1d95c59f14eaf26/frontend_test_table.json')
    .then(responseStatus)
    .then(response => response.json())
    .then(function (data) {
      if ($.isEmptyObject(data)) {
        $('.car-table').html('Нет данных');
        return;
      }

      let carsList = renderCarsTableHead();
      data.forEach(function(car) {
        carsList += renderCarsTableTr(car);
      });
      carsList += '</div>';

      $('.car-table').html(carsList);
    })
  .catch(function(error) {
    if (error.message == 'Unexpected end of JSON input') {
      $('.car-table').html('Нет данных');
    } else {
      alert('Упс! Кажется произошла ошибка, при получении данных. Попробуйте еще раз и, если она повториться, напишите, пожалуйста, нам.');
    }

    console.dir(error);
  });

  $('.filter-form').on('submit', function() {
    let addedCar = {};
    
    addedCar.title = escapeHtml($('input[name="name"]').val());
    addedCar.description = escapeHtml($('input[name="description"]').val());
    addedCar.year = escapeHtml($('input[name="year"]').val());
    addedCar.color = escapeHtml($('input[name="color"]:checked').val());
    addedCar.status = escapeHtml($('li.selected').text());
    addedCar.price = escapeHtml($('input[name="price"]').val());

    $('.car-table').append( renderCarsTableTr(addedCar) );

    return false;
  });

  $document.on('click touch', '.delete-btn', function() {
    $(this).parents('.car-table__tr').remove();

    return false;
  });

  $document.on('input', '.js-priceMask', function() {
    if ($(this).val() != '') {
      $(this).val( formatter.format( +$(this).val().replace(/\s{1,}/g, '') ) );
    }
  });

  $document.on('keydown', '.js-numInput, .js-priceMask', function(e) {
    if( e.key.length == 1 && e.key.match(/[^0-9]/)) {
      return false;
    }
  });

  $document.on('focus input', '.js-inputField', function() {
    updateText( $(this) );
  });

  $document.on('click', '.js-goUp', function() {
    $('body, html').animate({
      scrollTop: 0
    }, 800);

    return false;
  });
});

$window.on('scroll', function() {
  scrollTgglClass($('.js-goUp'), 300, 'visible');
});

function renderCarsTableHead() {
  let trStart = flexCarTableFlag ? '<div class="car-table__tbody">\n<div class="car-table__tr">\n' : '<div class="car-table__th">\n';

  return trStart
  + '<div class="car-table__cell car-table__cell_th car-table__cell_name">Название</div>\n'
  + '<div class="car-table__cell car-table__cell_th car-table__cell_year">Год</div>\n'
  + '<div class="car-table__cell car-table__cell_th car-table__cell_color">Цвет</div>\n'
  + '<div class="car-table__cell car-table__cell_th car-table__cell_status">Статус</div>\n'
  + '<div class="car-table__cell car-table__cell_th car-table__cell_price">Цена</div>\n'
  + '<div class="car-table__cell car-table__cell_th car-table__cell_other"></div>\n'
  + '</div>\n';
}

function renderCarsTableTr(car) {
  let carDesc = car['description'] == '' ? '' : '<div class="car-table__desc">' + car['description'] + '</div>',
      carDescMobile = car['description'] == '' ? '' : '<div class="car-table__cell car-table__cell_desc">' + car['description'] + '</div>\n',
      colorStyle = car['color']=='white' ? ' car-table__color_border' : '';



  return '<div class="car-table__tr">\n'
  + '<div class="car-table__cell car-table__cell_name"><a href="#">' + car['title'] + '</a>' + carDesc + '</div>\n'
  + carDescMobile
  + '<div class="car-table__cell car-table__cell_year">' + car['year'] + '</div>\n'
  + '<div class="car-table__cell car-table__cell_color"><div class="car-table__color' + colorStyle + '" style="background-color: ' + car['color'] + ';"></div></div>\n'
  + '<div class="car-table__cell car-table__cell_status">' + getSaleStatus(car['status']) + '</div>\n'
  + '<div class="car-table__cell car-table__cell_price">' + formatter.format( car['price'].toString().replace(/\s{1,}/g, '') ) + ' руб.</div>\n'
  + '<div class="car-table__cell car-table__cell_other"><a class="delete-btn" href="#">Удалить</a></div>\n'
  + '</div>\n';
}

function getSaleStatus(itemStatus) {
  switch(itemStatus) {
    case 'pednding' || 'pending':
      return 'Ожидается';
    case 'out_of_stock':
      return 'Нет в наличии';
    case 'in_stock':
      return 'В наличии';
    default:
      return 'Уточнять';
  }
}

function responseStatus(response) {
  if (response.status !== 200) {
    return Promise.reject(new Error(response.statusText));
  }

  return Promise.resolve(response);
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function updateText($input) {
  let val = $input.val();

  if (val != '') {
    $input.closest('.inp-base').addClass('no-empty');
  } else {
    $input.closest('.inp-base').removeClass('no-empty');
  }

  return false;
}

function scrollTgglClass(obj, space, className) {
  if ($window.scrollTop() > space) {
    obj.addClass(className);
  } else {
    obj.removeClass(className);
  }
}