//console.log('Hello, World!');
// function add(a, b) {
//     return a + b;

// }

// console.log((2, 5));

// [a,b,c,d,e] = [1,2,3,4,5];
// [a, b, c, d, e] = [11, 22, 34, 48, 50];
// console.log(a,b,c,d,e);



// map method----

let arr = [45, 23, 21]
console.log(arr);
let a = arr.map((value) => {
    console.log(value)
    return value + 1
})
console.log(a) 


let a = arr.map((value, index) => {
    console.log(value, index)
    return value + 1
})
console.log(a)

let a = arr.map((value, index, array) => {
    console.log(value, index, array)
    return value + index
})
console.log(a)


// filter method----
let arr2 = [45, 23, 21, 0, 3, 5]
let a2 = arr2.filter((a) => {
    return a < 10
})
console.log(a2)

// reduce method----
let arr3 = [45, 23, 21, 0, 3, 5, 2, 4, 3, 4.62]
let narr3 = arr3.reduce((h1, h2) => {
    return h1 + h2

})
console.log(narr3)


//promise method----
let promise = new Promise(function (resolve, reject) {
    alert("Hello")
    resolve(56)
})

console.log("hello")
setTimeout(function () {
    console.log("hi in 7 second")
}, 2000)
console.log("jai jagannath") 
console.log(promise)

let p = new Promise((resolve, reject) => {
    console.log("promise is pending")
    setTimeout(() => {
        alert("i am a promise and i am fulfilled")
        //resolve(true)
        reject(new Error("Promise rejected")) 
    }, 5000)
})
console.log(p)