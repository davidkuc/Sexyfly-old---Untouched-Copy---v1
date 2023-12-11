headerTopBarFormatter();

headerMenuFormatter(768,[
  'search'
]);

addEvent(window,'resize',function(){

  headerTopBarFormatter();

  headerMenuFormatter(768,[
    'search'
  ]);
});
