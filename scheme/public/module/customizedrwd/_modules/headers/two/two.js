headerTopBarFormatter();

headerMenuFormatter(768);

addEvent(window,'resize',function(){

  headerTopBarFormatter();

  headerMenuFormatter(768);
});
