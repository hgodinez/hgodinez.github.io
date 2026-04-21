(function () {
  'use strict';

  var search = document.getElementById('search_box');
  var filter = document.getElementById('category_filter');
  var posts = document.querySelectorAll('#posts .item');

  function apply() {
    var q = (search && search.value || '').trim().toLowerCase();
    var cat = (filter && filter.value || 'all').toUpperCase();
    posts.forEach(function (el) {
      var title = el.getAttribute('data-title') || '';
      var categories = el.getAttribute('data-category') || '';
      var matchQuery = !q || title.indexOf(q) !== -1;
      var matchCat = cat === 'ALL' || categories.indexOf(cat) !== -1;
      el.classList.toggle('hidden', !(matchQuery && matchCat));
    });
  }

  if (search) search.addEventListener('input', apply);
  if (filter) filter.addEventListener('change', apply);
})();
