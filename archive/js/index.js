(function() {
  
  /* http://stackoverflow.com/questions/5699127/how-to-find-out-the-position-of-the-first-occurrence-of-the-difference-between-t */
  function findDiff(a, b) {
    a = a.toString();
    b = b.toString();
    for (var i = 0; i < Math.min(a.length, b.length); i++) {
      if (a.charAt(i) !== b.charAt(i)) { return i; }
      
    }
    if (a.length !== b.length) { return Math.min(a.length, b.length); }
    return -1;
    
  }
  
  data = [
    "Hola!",
    "Hello!",
    "Hallo!", 
    "I'm Humberto Godinez",
    "I'm an Actuary",
    "I'm a Mathematician",
    "I'm a Financial Data Scientist",
    "I'm a Teaching Enthusiast",
    "I'm an Avid Researcher",
    "I'm always learning",
    "I <3 my family",
    "I'm interested in Risk Management",
    "I'm interested in Time Series",
    "I'm interested in Financial Modelling",
    "I'm interested in Pension Systems",
    "I'm interested in CryptoFinance",
    "I'm interested in Big Data & Machine Learning",
    "Be Curious",
    "Think Great",
    ""
    ];
  
  data_ss = data.map(function(d, i){
    return ((i===0) ? 0 : findDiff(data[i], data[i - 1]));
  });
  data_ss.shift(); // remove 1st element!
  
  jQuery("#typed").typed({
      strings: data,
      stringsstops: data_ss,
      startDelay: 3500,
      typeSpeed: 130
  });
  
})();