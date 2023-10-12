/**
 * document.querySelectorのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element}
 */
const $ = selector => document.querySelector(selector);

/**
 * document.querySelectorAllのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element[]}
 */
const $$ = selector => document.querySelectorAll(selector);

/**
 * ページ読み込み時にタイトル画面を表示します
 */
window.addEventListener("load", () => {
    $(`body`).addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    $(".drop").addEventListener("dragover", event => {
        event.preventDefault();
    });
    $(".drop").addEventListener("drop", event => {
        event.preventDefault();
        Array.from(event.dataTransfer.files).forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                // 元画像を読み込み
                const inputImageData = new Image();
                inputImageData.src = reader.result;
                inputImageData.onload = event => {
                    // canvasを作成
                    const convertCanvas = document.createElement("canvas");
                    let settingHeight = Number.parseFloat($("#height").value);
                    let settingWidth = Number.parseFloat($("#width").value);
                    if ($("#height").value.includes("x")) settingHeight *= inputImageData.naturalHeight;
                    if ($("#width").value.includes("x")) settingWidth *= inputImageData.naturalWidth;
                    convertCanvas.height = settingHeight;
                    convertCanvas.width = settingWidth;
                    // canvasに描画
                    const context = convertCanvas.getContext("2d");
                    context.drawImage(inputImageData, 0, 0, settingWidth, settingHeight);
                    // data URIを生成
                    const typeList = new Map([
                        ["png", ["image/png", ".png"]],
                        ["jpg", ["image/jpeg", ".jpg"]],
                        ["gif", ["image/gif", ".gif"]],
                        ["webp", ["image/webp", ".webp"]]
                    ]);
                    const resultDataURI = convertCanvas.toDataURL(typeList.get($("#format").value)[0]);
                    // 変換後の画像を埋め込み
                    const resultElement = document.createElement("div");
                    resultElement.classList.add("result");
                    const imageELement = document.createElement("img");
                    imageELement.src = resultDataURI;
                    resultElement.appendChild(imageELement);
                    const buttonElement = document.createElement("button");
                    buttonElement.innerHTML = `Download <span>${$("#format").value}</span>`
                    resultElement.appendChild(buttonElement);
                    $("div.list").appendChild(resultElement);
                    // 画像ダウンロードを仕込む
                    buttonElement.onclick = event => {
                        const link = document.createElement('a');
                        link.href = resultDataURI;
                        link.download = `${crypto.randomUUID().slice(0, 7)}${typeList.get($("#format").value)[1]}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                }
            };
        });
    });
});