$(function () {
  function updateWaktu() {
    const waktuDiv = document.querySelector(".waktu");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    let waktu;
    if (hours >= 4 && hours < 10) {
      waktu = "pagi";
    } else if (hours >= 10 && hours < 15) {
      waktu = "siang";
    } else if (hours >= 15 && hours < 18) {
      waktu = "sore";
    } else {
      waktu = "malam";
    }
    const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds} ${waktu}`;
    waktuDiv.textContent = formattedTime;
    waktuDiv.style.background = "#1e1f22";
  }
  setInterval(updateWaktu, 100);

  $(document).ready(function () {
    setInterval(updateWaktu, 100);
    updateWaktu(true);
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);

    var bg = urlParams.get("bg");
    var jam = urlParams.get("jam");
    var jarak = urlParams.get("jarak");
    var pesan = urlParams.get("pesan");
    var input = urlParams.get("input");

    if (bg === "false") {
      document.body.style.background = "transparent";
    }

    if (jam === "hidden") {
      document.querySelector(".waktu").style.display = "none";
    }

    if (jarak !== null) {
      const ul = document.querySelector("ul");
      ul.style.marginTop = jarak + "px";
    }

    if (pesan === "false") {
      const messages = document.querySelector("#messages");
      messages.style.display = "none";
    }

    if (input === "false") {
      const form = document.querySelector("#form");
      form.style.display = "none";
    }
  });

  function cek() {
    const localName = localStorage.getItem("nama");
    if (localName !== null) {
      $("#name").val(localName);
      $("#name").prop("disabled", true);
    }
  }
  cek();

  var socket = io();
  socket.on("connect", function () {
    const loadings = document.querySelector(".loadings");
    loadings.remove();
    socket.emit("chat history");
  });

  socket.on("chat history", function (history) {
    $("#messages").empty();
    for (var i = 0; i < history.length; i++) {
      appendMessage(history[i]);
    }
  });

  $(document).ready(function () {
    $("#image").change(function (e) {
      $("#uploads").text($("#image")[0].files[0].name);
    });
  });

  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function (blob) {
          callback(blob);
        }, "image/jpeg");
      };
    };

    reader.readAsDataURL(file);
  }
  function notiv(pesan) {
    const notiv = document.querySelector(".notiv");
    notiv.textContent = pesan;
    notiv.classList.add("show");
    setTimeout(() => {
      notiv.classList.remove("show");
    }, 7000);
  }
  $("#form").submit(function (e) {
    e.preventDefault();
    var storedData = JSON.parse(localStorage.getItem("tag"));
    if (storedData) {
      keynya = storedData[1].id;
      dari = storedData[0].nama;
    }
    const inputPesan = document.getElementById("input");
    const nama = document.getElementById("name");
    if (nama.value.trim() === "") {
      notiv("nama kosong");
    } else if (inputPesan.value.trim() === "") {
      notiv("pesan kosong");
    } else {
      const bilangan1 = Math.floor(Math.random() * 10) + 1;
      const bilangan2 = Math.floor(Math.random() * 10) + 1;
      const jawaban = bilangan1 + bilangan2;
      const kuis = document.querySelector("div.q");
      kuis.style.display = "block";
      kuis.classList.add("zIndex");
      kuis.innerHTML = `
      <div class="kuis">
    <div class="kotak">
    <div class="soal">
      <div>
      <span class="nilai1">${bilangan1}</span>
      <span>+</span>
      <span class="nilai2">${bilangan2}</span>
      <span>=</span>
      </div>
      <input
        type="number"
        id="jawaban"
        placeholder="...."
        autofocus
      />
    </div>
    <button type="button" id="kirim">kirim</button>
  </div></div>`;

      const kirim = document.getElementById("kirim");
      kirim.addEventListener("click", () => {
        const hasil = document.getElementById("jawaban").value;
        if (hasil !== "") {
          kuis.style.display = "none";
          kuis.classList.remove("zIndex");
          var name = $("#name").val();
          if (parseInt(hasil) === jawaban) {
            var name = $("#name").val();
            localStorage.setItem("nama", name);
            var message = $("#input").val();

            if (name.length >= 11) {
              name = name.slice(0, 11);
            }

            if (message.length >= 200) {
              message = message.slice(0, 200);
            }
            var image = $("#image")[0].files[0];

            if (name && message) {
              cek();

              if (image) {
                compressImage(image, function (compressedBlob) {
                  var reader = new FileReader();
                  reader.onload = function (event) {
                    socket.emit("chat message", {
                      name,
                      message,
                      dari,
                      keynya,
                      image: event.target.result,
                    });
                    $("#input").val("");
                    $("#image").val("");
                    $("#uploads").text("Upload file");
                  };
                  reader.readAsDataURL(compressedBlob);
                });
              } else if (dari == "" || keynya == "") {
                socket.emit("chat message", {
                  name,
                  message,
                });
                $("#input").val("");
              } else {
                socket.emit("chat message", {
                  name,
                  message,
                  dari,
                  keynya,
                });
                $("#input").val("");
              }
            }
          } else {
            notiv("jawaban nya keren");
          }
        }
      });
    }
  });

  socket.on("chat message", function (msg) {
    appendMessage(msg);
  });

  function appendMessage(msg) {
    $("#messages").append(
      $(`<li id="${msg.key}" class="pesanList">`).html(`
      <div class="areaInfo">
      <p class="users nm" style="--clr: ${msg.color};">${msg.name}</p>
      ${
        msg.balas.key != null
          ? `<div class="balas"><span>&gt;</span><span class="balasDari" key="${msg.balas.key}">@${msg.balas.dari}</span></div>`
          : ""
      }
      </div>
      <div class="areaP">
      <span class="PesanTerkirim">${msg.message}</span>
      </div>
      ${
        msg.image
          ? `<br><div class="areaImg">
            <img src="${msg.image}" class="gambarPhoto" alt="${msg.name}" style="max-width: 200px;" loading="lazy" />
            </div>`
          : ""
      }
    `)
    );
  }

  const pA = document.querySelector(".pesanArea");
  const tag = document.createElement("div");
  tag.className = "tag";
  const messages = document.getElementById("messages");
  messages.addEventListener("mousemove", function () {
    let kondisi = true;
    const balasDari = document.querySelectorAll(".balasDari");
    const pesanList = document.querySelectorAll(".pesanList");

    balasDari.forEach((s) => {
      let SK = s.getAttribute("key");
      s.addEventListener("click", () => {
        if (kondisi) {
          pesanList.forEach((p) => {
            let PT = p.id;
            if (PT === SK) {
              p.classList.add("tag-target");
              setTimeout(() => {
                p.classList.remove("tag-target");
              }, 5000);
              p.scrollIntoView({ behavior: "smooth" });
            } else {
              p.classList.remove("tag-target");
            }
          });

          kondisi = false;
          setTimeout(() => {
            kondisi = true;
          }, 5500);
        }
      });
    });

    const areaImg = document.querySelectorAll(".areaImg img");
    areaImg.forEach((areaI) => {
      areaI.addEventListener("click", function () {
        areaI.parentElement.classList.add("showImg");
      });
      areaI.parentElement.addEventListener("click", (e) => {
        if (e.target.classList.contains("showImg")) {
          areaI.parentElement.classList.remove("showImg");
        }
      });
    });
  });
  let keynya;
  let id;
  let dari = "";
  window.addEventListener("mousemove", () => {
    var storedData = JSON.parse(localStorage.getItem("tag"));
    if (storedData) {
      tag.innerHTML = `<span id="tag" class="in-tag">@${storedData[0].nama}</span><span id="delete">X</span>`;
      pA.appendChild(tag);
      const deletes = document.getElementById("delete");
      deletes.addEventListener("click", () => {
        localStorage.removeItem("tag");
        deletes.parentElement.remove();
        keynya = "";
      });
      keynya = storedData[1].id;
      dari = storedData[0].nama;
    }
  });

  messages.addEventListener("click", function (event) {
    const target = event.target;

    dari = target.textContent;
    if (target.classList.contains("nm")) {
      id = target.parentNode.parentNode.id;
      //<----simpan ke local
      var data = [{ nama: target.textContent }, { id: id }];
      localStorage.setItem("tag", JSON.stringify(data));

      //--->

      tag.innerHTML = `<span id="tag" class="in-tag">@${target.textContent}</span><span id="delete">X</span>`;
      pA.appendChild(tag);
      const deletes = document.getElementById("delete");
      deletes.addEventListener("click", () => {
        localStorage.removeItem("tag");
        deletes.parentElement.remove();
        keynya = "";
      });
    }

    $("#form").submit(function (e) {
      e.preventDefault();
      if (id !== "") {
        const inputPesan = document.getElementById("input");
        const nama = document.getElementById("name");
        if (nama.value.trim() === "") {
          notiv("nama kosong");
        } else if (inputPesan.value.trim() === "") {
          notiv("pesan kosong");
        } else {
          const bilangan1 = Math.floor(Math.random() * 10) + 1;
          const bilangan2 = Math.floor(Math.random() * 10) + 1;
          const jawaban = bilangan1 + bilangan2;
          const kuis = document.querySelector("div.q");
          kuis.style.display = "block";
          kuis.classList.add("zIndex");
          kuis.innerHTML = `
            <div class="kuis">
          <div class="kotak">
          <div class="soal">
            <div>
            <span class="nilai1">${bilangan1}</span>
            <span>+</span>
            <span class="nilai2">${bilangan2}</span>
            <span>=</span>
            </div>
            <input
              type="number"
              id="jawaban"
              placeholder="...."
              autofocus
            />
          </div>
          <button type="button" id="kirim">kirim</button>
        </div></div>`;

          const kirim = document.getElementById("kirim");
          kirim.addEventListener("click", () => {
            const hasil = document.getElementById("jawaban").value;
            if (hasil !== "") {
              kuis.style.display = "none";
              kuis.classList.remove("zIndex");
              var name = $("#name").val();
              if (parseInt(hasil) === jawaban) {
                var name = $("#name").val();
                localStorage.setItem("nama", name);
                var message = $("#input").val();

                if (name.length >= 11) {
                  name = name.slice(0, 11);
                }

                if (message.length >= 200) {
                  message = message.slice(0, 200);
                }

                var image = $("#image")[0].files[0];

                if (name && message) {
                  cek();

                  if (image) {
                    compressImage(image, function (compressedBlob) {
                      var reader = new FileReader();
                      reader.onload = function (event) {
                        socket.emit("chat message", {
                          name,
                          message,
                          dari,
                          keynya,
                          image: event.target.result,
                        });
                        $("#input").val("");
                        $("#image").val("");
                        $("#uploads").text("Upload file");
                      };
                      reader.readAsDataURL(compressedBlob);
                    });
                  } else if (dari == "" || keynya == "") {
                    socket.emit("chat message", {
                      name,
                      message,
                    });
                    $("#input").val("");
                  } else {
                    socket.emit("chat message", {
                      name,
                      message,
                      dari,
                      keynya,
                    });
                    $("#input").val("");
                  }
                }
              } else {
                notiv("jawaban nya keren");
              }
            }
          });
        }
      }
    });
  });

  document.querySelector("textarea").addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
});
