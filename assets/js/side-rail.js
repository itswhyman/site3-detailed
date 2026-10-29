(function(){
  var nav = document.getElementById('topNav');
  var rail = document.getElementById('sideRail');
  var track = document.getElementById('railTrack');
  var src = document.getElementById('railLinksSource');
  if (!rail || !track || !src) return;
  var links = [];
  function rebuild(){
    track.innerHTML = '';
    links = [];
    src.querySelectorAll('a[data-sec]').forEach(function(s){
      var a = s.cloneNode(true);
      a.classList.add('rail-link');
      track.appendChild(a);
      links.push(a);
    });
  }
  function layout(activeIdx){
    if (!links.length) return;
    var H = track.clientHeight || rail.clientHeight || (window.innerHeight - 100);
    var baseH = 36, activeH = 44, gap = 10, n = links.length;
    var yTop = 4;
    for (var i = 0; i < activeIdx; i++){
      links[i].classList.remove('on');
      links[i].style.top = yTop + 'px';
      yTop += baseH + gap;
    }
    var yBot = H - 4;
    for (var j = n - 1; j > activeIdx; j--){
      yBot -= baseH;
      links[j].classList.remove('on');
      links[j].style.top = yBot + 'px';
      yBot -= gap;
    }
    var a = links[activeIdx];
    a.classList.add('on');
    var activeTop = Math.round(H * 0.5 - activeH * 0.5);
    var minTop = yTop + 4;
    var maxTop = H - activeH - 8;
    if (activeIdx < n - 1){
      var nextTop = parseFloat(links[activeIdx + 1].style.top);
      if (!isNaN(nextTop)) maxTop = nextTop - activeH - 8;
    }
    if (activeTop < minTop) activeTop = minTop;
    if (activeTop > maxTop) activeTop = maxTop;
    a.style.top = activeTop + 'px';
  }
  function currentIdx(){
    var midY = window.scrollY + window.innerHeight * 0.32, idx = 0;
    if (window.scrollY < 40) return 0;
    links.forEach(function(a, i){
      var id = a.getAttribute('data-sec');
      if (id === 'hero' || id === 'home') return;
      var el = document.getElementById(id);
      if (el && el.offsetTop <= midY) idx = i;
    });
    var foot = document.getElementById('footer');
    if (foot && window.scrollY + window.innerHeight > foot.offsetTop + 30) idx = links.length - 1;
    return idx;
  }
  var last = -1;
  function onScroll(){
    var navH = (nav && nav.offsetHeight) ? nav.offsetHeight : 72;
    rail.style.top = (navH - 10) + 'px';
    var idx = currentIdx();
    if (idx !== last || last < 0){ last = idx; layout(idx); }
  }
  rebuild();
  layout(0);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function(){ last = -1; onScroll(); });
  onScroll();
})();