function a() {
  c();
  return;
}

function b() {
  c();
  return;
}

function c() {
  let object = d();
  let propertyToAccess = 'wrongProperty'
  let methodToCall = object[propertyToAccess];

  // If 'methodToCall' is not a function, this will throw a TypeError.
  return methodToCall();
}

function d(): { [key: string]: any } {
  let x = 1;
  x += 4;
  let y = x+1;

  let obj = {
    correctProperty: x, 
    anotherProperty: y
  };
  
  return obj;
}

a();