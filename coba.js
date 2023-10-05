// for (let i = 1; i <= 5; i++) {
//   let bintang = "";
//   for (let j = 1; j <= i; j++) {
//     bintang += "*";
//   }
//   console.log(bintang);
// }

// for (let i = 1; i <= 5; i++) {
//   let spasi = "";
//   let bintang = "";
//   for (let j = 1; j < i; j++) {
//     spasi += " ";
//   }
//   for (let k = 5; k >= i; k--) {
//     bintang += "*";
//   }
//   console.log(spasi + bintang);
// }

// for (let i = 5; i >= 1; i--) {
//   let bintang = "";
//   for (let j = 1; j <= i; j++) {
//     bintang += "*";
//   }
//   console.log(bintang);
// }

for (let a = 1; a <= 5; a++) {
  let spasi = "";
  let bintang = "";
  for (let b = 1; b <= a; b++) {
    spasi += " ";
  }
  for (let c = 5; c >= a; c--) {
    bintang += "*";
  }
  console.log(spasi + bintang);
}

for (let a = 1; a <= 5; a++) {
  let bintang = "";
  for (let b = 1; b <= a; b++) {
    bintang += "*";
  }
  console.log(bintang);
}

for (let a = 5; a >= 1; a--) {
  let bintang = "";
  for (let b = 1; b <= a; b++) {
    bintang += "*";
  }
  console.log(bintang);
}

for (let a = 5; a >= 1; a--) {
  let spasi = "";
  let bintang = "";
  for (let b = 1; b < a; b++) {
    spasi += " ";
  }
  for (let c = 5; c >= a; c--) {
    bintang += "*";
  }
  console.log(spasi + bintang);
}
