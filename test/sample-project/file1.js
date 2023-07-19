function a(prop) {
  c(prop);
  return;
}

function b() {
  c();
  return;
}

function c(prop) {
  let object = d();
  let propertyToAccess = prop;
  let methodToCall = object[propertyToAccess].blah;

  // If 'methodToCall' is not a function, this will throw a TypeError.
  return;
}

function d() {
  let x = 1;
  x += 4;
  let y = x+1;

  let obj = {
    correctProperty: x, 
    anotherProperty: y
  };
  
  return obj;
}

function e() {
  console.log('blah')
}

function f() {
  e();
  return;
}

module.exports = {  a  };