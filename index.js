const logoURL = chrome.runtime.getURL("images/logo.png");
const emoticonsUrl = chrome.runtime.getURL("data/emoticons.json");
const mentionsUrl = chrome.runtime.getURL("data/mentions.json");

let emoticons = [];
let mention = [];

let countComment = 0;
let botWorkCycle = null;

let isBotWorking = true;
let countdownTimer = {};

let IsBotTyping = false;

$(document).ready(async () => {
  await loadResources();

  startModal();

  const rootInterval = setInterval(() => {
    const container = $("._aa6e");

    if (container.length > 0) {
      clearInterval(rootInterval);

      events();

      $("._aa6e").append(`
        <div class="countdown-root">
          <div class="countdown-container">
            <h1 style="margin-bottom: 15px">Contador</h1>

            <div class="countdown-content">
              <p>Tempo do próximo comentário (s):</p>
              <div id="next-comment">00:00:00</div>
            </div>

            <div class="countdown-content">
              <p>Tempo ativo:</p>
              <div id="countdown">00:00:00</div>
            </div>

            <div class="countdown-content">
              <p>Cronômetro de pausa:</p>
              <div id="cronometer">00:00:00</div>
            </div>
            
            <div class="countdown-content">
              <p>Comentários feitos:</p>
              <div id="countComment">0</div>
            </div>
          </div>
        </div>
      `);
    }
  }, 1000);
});

async function loadResources() {
  emoticons = await loadList(emoticonsUrl);
  mentions = await loadList(mentionsUrl);
}

async function loadList(url) {
  return fetch(url).then((response) => response.json());
}

function startModal() {
  let modal = `
    
    <div 
      class="modal fade main-modal" 
      id="main-modal" 
      data-backdrop="static"
      data-keyboard="false"
			tabindex="-1" 
			role="dialog"
		>
      <div class="modal-dialog" role="document">
        <div class="modal-content p-3">
          <div class="modal-logo-root">
            <img src="${logoURL}" alt="logomarca" />
          </div>
          
            <!-- Tela 1 -->
            <form id="frmStep1">
              
              <h1 class="modal-title gradient">Robô de comentários</h1>
              
              <h6 class="modal-subtitle">Selecione a lista que será usada para marca na foto oficial</h6>

              <select class="form-control" id="list">
                <option value="">Selecione</option>
                <option value="mentions">
                  Lista @'s
                </option>
                
                <option value="I want">
                  Lista "Eu quero"
                </option>

                <option value="ok">
                  Lista "Ok"
                </option>

                <option value="emoticons">
                  Lista "Emoticons"
                </option>
              </select>

              <h6 style="color: #fff; font-size: 18px" class="mt-3 mb-3">Ou criar própria lista:</h6>
              
              <input class="form-control" id="persoList" autocomplete="off" placeholder='Separe os elementos por ";"' />
              
              <div class="form-row" style="justify-content: center;">
                  <div style="width: 98%;" class="alert alert-danger mt-3" id="alert-step-1" role="alert" hidden>
                    <span></span>
                  </div>
              </div>

              <div class="modal-button-root mt-2">
                <button type="submit" class="btn btn-primary">Próximo</button>
              </div>
            </form>

            <!-- Tela 2 -->
            <form id="frmStep2" hidden>
              <h1 class="modal-title gradient">Robô de comentários</h1>
              
              <h6 class="modal-subtitle">Informe quantos elementos inserir a cada comentário feito</h6>
              
              <input type="number" class="form-control" id="qtdItems" min="1" value="1" required />

              <div class="modal-button-root">
                <button type="submit" class="btn btn-primary">Próximo</button>
              </div>
            </form>

            <!-- Tela 3 -->
            <form id="frmStep3" hidden>
              <h1 class="modal-title gradient">Robô de comentários</h1>
              
              <h6 class="modal-subtitle">Informe o tempo de atraso de cada comentários</h6>

              <div class="row">
                <div class=col col-6>
                  <div class="form-group">
                    <label for="exampleFormControlInput1">Tempo mínimo (s)</label>
                    
                    <input type="number" class="form-control" id="timeMin" min="10" max="600" value="10" required />
                  </div>
                </div>

                <div class=col col-6>
                  <div class="form-group">
                    <label for="exampleFormControlInput1">Tempo máximo (s)</label>
                    
                    <input type="number" class="form-control" id="timeMax" min="10" max="600" value="30" required />
                  </div>
                </div>
              </div>

              <div class="modal-button-root">
                <button type="submit" class="btn btn-primary">Próximo</button>
              </div>
            </form>
            
            <!-- Tela 4 -->
            <form id="frmStep4" hidden>
              <h1 class="modal-title gradient">Robô de comentários</h1>
              
              <h6 class="modal-subtitle">Informe a condição de pausa do Robô</h6>

              <!-- Condição de pausa do bot -->

              <div class="row">
                <div class=col col-6>
                  <div class="form-group">
                    <label for="exampleFormControlInput1">Critério</label>
                    
                    <select class="form-control" id="pauseConditionCriteria">
                      <option value="">Selecione</option>

                      <option value="byNumber">
                        Por quantidade de comentários
                      </option>
                      
                      <option value="byTimer">
                        Por tempo de execução (m)
                      </option>                              
                    </select>
                  </div>
                </div>

                <div class=col col-6>
                  <div class="form-group">
                    <label for="exampleFormControlInput1">Quantidade</label>
                    
                    <input type="number" class="form-control" id="pauseConditionValue" min="1" max="600" value="1" required />
                  </div>
                </div>
              </div>

              

              <!-- Tempo de pausa do bot -->
              <div class="row">
                <div class=col col-11>
                  <div class="form-group">    
                  <h6 style="color: #fff; font-size: 18px" class="mt-3 mb-3">Encerrar o bot ao invés de pausar?</h6>
                  </div>
                </div>

                <div class=col col-1>
                  <div class="form-group">    
                    <input type="checkbox" class="form-control form-check-input" id="stopBotCheck" />
                  </div>
                </div>


              </div>

              
              <!--
              <p style="color: #fff; font-size: 16px" class="mt-3 mb-3">Encerrar o bot ao invés de pausar</p>
              <input type="checkbox" class="form-control" id="stopBotCheck" />
              -->
              
              <h6 style="color: #fff; font-size: 18px" class="mt-3 mb-3">Defina um período de pausa em minutos:</h6>
              <input type="number" class="form-control" id="interval" min="1" max="600" value="1" required />
              
              <div class="form-row" style="justify-content: center;">
                  <div style="width: 98%;" class="alert alert-danger mt-3" id="alert-step-4" role="alert" hidden>
                    <span></span>
                  </div>
              </div>
              
              <div class="modal-button-root">
                <button type="submit" id="start-button-step-3" class="btn btn-primary start-button">Iniciar</button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  `;

  $("body").append(modal);
}

function events() {
  // Evento de exibir modal
  $("#main-modal").modal("show");

  $("#stopBotCheck").on("change", function (e) {
    $("#interval").attr("disabled", e.target.checked);
  });

  // Evento ao dar submit na lista
  $("#frmStep1").on("submit", function (e) {
    e.preventDefault();

    // Valida campos
    if (!$("#persoList").val() && !$("#list option:selected").val()) {
      $("#alert-step-1 span").text("Preencha alguma das opções.");
      $("#alert-step-1").attr("hidden", false);
    } else {
      $("#alert-step-1 span").text("");
      $("#alert-step-1").attr("hidden", true);

      $("#frmStep1").attr("hidden", true); // Esconde form antigo

      let value = $("#list option:selected").val();
      if (["emoticons", "mentions"].includes(value) || $("#persoList").val()) {
        $("#frmStep2").attr("hidden", false); // Mostra form do proximo passo
      } else {
        $("#frmStep3").attr("hidden", false); // Mostra form do proximo passo
      }
    }
  });

  // Evento ao dar submit na quantidade de items
  $("#frmStep2").on("submit", function (e) {
    e.preventDefault();

    $("#frmStep2").attr("hidden", true); // Esconde form antigo
    $("#frmStep3").attr("hidden", false); // Mostra form do proximo passo
  });

  // Evento ao dar submit nos intervalos de comentarios do bot
  $("#frmStep3").on("submit", function (e) {
    e.preventDefault();

    $("#frmStep3").attr("hidden", true); // Esconde form antigo
    $("#frmStep4").attr("hidden", false); // Mostra form do proximo passo
  });

  // Evento ao iniciar o bot
  $("#frmStep4").on("submit", function (e) {
    e.preventDefault();

    // Valida campos
    if (!$("#pauseConditionCriteria option:selected").val()) {
      $("#alert-step-4 span").text("Escolha o critério de pausa.");
      $("#alert-step-4").attr("hidden", false);
    } else {
      $("#alert-step-4 span").text("");
      $("#alert-step-4").attr("hidden", true);

      setLoading();
      handleBotDataMount();
    }
  });
}

function setLoading() {
  $("#frmStep3 button").attr("disabled", true);
  $("#frmStep3 button").text("Aguarde...");
}

function handleBotDataMount() {
  let data = {
    qtdItems: parseInt($("#qtdItems").val()),
    times: {
      min: parseInt($("#timeMin").val()),
      max: parseInt($("#timeMax").val()),
    },
    interval: parseInt($("#interval").val()),
    pauseCondition: {
      criteria: $("#pauseConditionCriteria").val(),
      value: parseInt($("#pauseConditionValue").val()),
    },
    abortBotOnPauseTime: $("#stopBotCheck").is(":checked"),
  };

  if ($("#persoList").val()) {
    data.list = $("#persoList").val().split(";");
  } else {
    const options = { emoticons, mentions, ok: ["ok"], "I want": ["Eu quero"] };
    const selectedOption = $("#list option:selected").val();
    data.list = options[selectedOption];
  }

  // Fechar modal
  $("#main-modal").modal("hide");

  startCountdown();
  runBot(data);
}

function startCountdown() {
  const time = new Date().getTime();

  $("#countdown")
    .countdown(time, { elapse: true })
    .on("update.countdown", function (event) {
      const $this = $(this);
      $this.html(event.strftime("<span>%H:%M:%S</span>"));

      countdownTimer = event;
    });
}

function runBot(args) {
  const postToBotWork = location.href;

  let { list, qtdItems, times, interval, pauseCondition, abortBotOnPauseTime } =
    args;

  let sortTiming = setSortTiming(times.max, times.min);
  $("#next-comment").text(sortTiming);

  const handleInstagramCommentBlock = () => {
    const extraMinutesToWait = 4;

    pauseBotWork(interval + extraMinutesToWait, abortBotOnPauseTime);

    countComment--;
    $("#countComment").html(countComment);
  };

  const instagramErrorDivSelector = ".CgFia";
  const instagramErrorMessageSelector = "div[class='HGN2m XjicZ']";
  $(instagramErrorDivSelector).on(
    "DOMNodeInserted",
    instagramErrorMessageSelector,
    handleInstagramCommentBlock
  );

  botWorkCycle = setInterval(() => {
    if (IsBotTyping) return;

    if (!isPostToBotWork(postToBotWork)) {
      stopBotWork();
      return;
    }

    if (!isBotWorking) {
      return;
    }

    hadInstagramBlock = false;

    // Sorteias os elementos da lista
    list = list.sort(randElementsList);

    // Pega os elementos de acordo com a quantidade de items
    const elementsSelected = list.slice(0, qtdItems);
    sendComment(elementsSelected);

    countComment++;
    $("#countComment").html(countComment);

    // Sorteias o tempo novamente
    sortTiming = setSortTiming(times.max, times.min);
    $("#next-comment").text(sortTiming);

    if (isTimeToBotPause(pauseCondition)) {
      pauseBotWork(interval, abortBotOnPauseTime);
      return;
    }
  }, parseInt(`${sortTiming}000`));
}

function setSortTiming(max, min) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isPostToBotWork(postToBotWork) {
  return location.href == postToBotWork;
}

function stopBotWork() {
  stopCountdown();
  clearInterval(botWorkCycle);
}

function randElementsList() {
  return Math.round(Math.random()) - 0.5;
}

async function sendComment(list) {
  // input do comentario
  const inputComment = document.querySelector("form._aidk > textarea");
  // button para publicar o comentario
  const publishButton = document.querySelector(
    "form._aidk div.x1i10hfl.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w"
  );

  let html = "";

  for (const element of list) {
    html += `${element} `;
  }

  inputComment.value = "";
  startTypingSimulation(inputComment, html);

  await timeout(100 * html.length + 100);

  inputComment.dispatchEvent(new Event("input", { bubbles: true }));

  publishButton.removeAttribute("disabled");
  publishButton.click();
}

function startTypingSimulation(input, text) {
  let length = text.length;
  let i = 0;
  let speed = 50;

  IsBotTyping = true;

  simulateTyping();

  function simulateTyping() {
    if (i >= length) {
      IsBotTyping = false;
      return;
    }

    input.value += text[i];
    i++;
    setTimeout(simulateTyping, speed);
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wasCommentSendWithSuccess() {
  return !$(".HGN2m.XjicZ");
}

function pauseBotWork(interval, abortBotOnPauseTime) {
  if (abortBotOnPauseTime) {
    stopBotWork();
    return;
  }

  isBotWorking = false;

  stopCountdown();

  startIntervalCronometer(interval);
  setBotInterval(interval);
}

function stopCountdown() {
  $("#countdown").countdown("pause");
  $("#countdown").text("00:00:00");
}

function startIntervalCronometer(interval) {
  const currentTime = new Date().getTime();
  const time = new Date(currentTime + interval * 60 * 1000).getTime();

  $("#cronometer")
    .countdown(time, { elapse: false })
    .on("update.countdown", function (event) {
      const $this = $(this);

      $this.html(event.strftime("<span>%H:%M:%S</span>"));
    })
    .on("finish.countdown", function (event) {
      const $this = $(this);

      $this.html(event.strftime("<span>%H:%M:%S</span>"));
    });
}

function isTimeToBotPause(pauseCondition) {
  const { value, criteria } = pauseCondition;

  let validations = {
    byNumber: () => countComment % value == 0,
    byTimer: () => {
      const minutes = getMinutesFromCountdown();
      return minutes % value == 0 && minutes > 0;
    },
  };

  return validations[criteria]();
}

function getMinutesFromCountdown() {
  return countdownTimer.offset.minutes;
}

function setBotInterval(interval) {
  setTimeout(() => {
    isBotWorking = true;
    startCountdown();
  }, interval * 60000);
}
