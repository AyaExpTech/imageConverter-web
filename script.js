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
 * D&Dによる画像変換を実装
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
                convertImage(reader.result);
            };
        });
    });
});

/**
 * 押下→ファイル選択ダイアログからの画像変換を実装
 */
window.addEventListener("load", () => {
    $(".drop").addEventListener("click", async event => {
        const fileHandles = await showOpenFilePicker({ "multiple": true });
        for await (const fileHandle of fileHandles) {
            const file = await fileHandle.getFile();
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                convertImage(reader.result);
            };
        }
    });
});

/**
 * 画像URLから画像を変換し、変換後の画像のダウンロードボタンを生成します。
 * @param {String} url - 画像URL
 * @returns {void}
 */
const convertImage = url => {
    // 元画像を読み込み
    const inputImageData = new Image();
    inputImageData.src = url;
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
            ["webp", ["image/webp", ".webp"]],
            ["bmp", ["image/bmp", ".bmp"]],
            ["gif", ["image/gif", ".gif"]],
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
