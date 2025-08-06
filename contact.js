/**
 * 各項目の入力を行う
 */
function validate() {

    // 1.エラー有無の初期化(true:エラーなし、false：エラーあり)
    var flag = true;

    // 2.エラーメッセージを削除
    removeElementsByClass("error");
    removeClass("error-form");

    // 3.お名前の入力をチェック
    // 3-1.必須チェック
    if (document.edit.name.value == "") {
        errorElement(document.edit.name, "お名前が入力されていません");
        flag = false;
    }

    // 4.ふりがなの入力をチェック
    // 4-1.必須チェック
    if (document.edit.kana.value == "") {
        errorElement(document.edit.kana, "ふりがなが入力されていません");
        flag = false;
    } else {
        // 4-2.ひらがなのチェック
        if (!validateKana(document.edit.kana.value)) {
            errorElement(document.edit.kana, "ひらがなを入れて下さい");
            flag = false;
        }
    }

    // 郵便番号
    if (document.edit.postal_code.value === "") {
        errorElement(document.edit.postal_code, "郵便番号が入力されていません");
        flag = false;
    } else if (!/^\d{3}-\d{4}$/.test(document.edit.postal_code.value)) {
        errorElement(document.edit.postal_code, "郵便番号の形式が正しくありません（例: 123-4567）");
        flag = false;
    }

    // 住所（都道府県、市区町村）
    if (document.edit.prefecture.value === "") {
        errorElement(document.edit.prefecture, "都道府県が入力されていません");
        flag = false;
    }
    if (document.edit.city_town.value === "") {
        errorElement(document.edit.city_town, "市区町村が入力されていません");
        flag = false;
    }

    // 6.電話番号の入力をチェック
    // 6-1.必須チェック
    if (document.edit.tel.value == "") {
        errorElement(document.edit.tel, "電話番号が入力されていません");
        flag = false;
    } else {
        // 6-2.電話番号の長さをチェック
        if (!validateTel(document.edit.tel.value)) {
            errorElement(document.edit.tel, "電話番号が違います");
            flag = false;
        }
    }

    // 5.メールアドレスの入力をチェック
    // 5-1.必須チェック
    if (document.edit.email.value == "") {
        errorElement(document.edit.email, "メールアドレスが入力されていません");
        flag = false;
    } else {
        // 5-2.メールアドレスの形式をチェック
        if (!validateMail(document.edit.email.value)) {
            errorElement(document.edit.email, "メールアドレスが正しくありません");
            flag = false;
        } else if (document.edit.email.value.length > 64) {
            errorElement(document.edit.email, "メールアドレスは64文字以内で入力してください");
            flag = false;
        }
    }

    // document1 のチェック
    var fileInput1 = document.edit.document1;
    if (fileInput1 && fileInput1.files.length > 0) {
        var file1 = fileInput1.files[0];
        var type1 = file1.type;
        // PNG もしくは JPEG 以外はエラー
        if (type1 !== "image/png" && type1 !== "image/jpeg") {
            errorElement(fileInput1, "ファイル形式は PNG または JPEG のみ許可されています");
            flag = false;
        } else if (file1.size > 2 * 1024 * 1024) {
            errorElement(fileInput1, "2MB以上はアップロードできません");
            flag = false;
        }
    }
    // document2 のチェック
    var fileInput2 = document.edit.document2;
    if (fileInput2 && fileInput2.files.length > 0) {
        var file2 = fileInput2.files[0];
        var type2 = file2.type;
        if (type2 !== "image/png" && type2 !== "image/jpeg") {
            errorElement(fileInput2, "ファイル形式は PNG または JPEG のみ許可されています");
            flag = false;
        } else if (file2.size > 2 * 1024 * 1024) {
            errorElement(fileInput2, "2MB以上はアップロードできません");
            flag = false;
        }
    }

    // 7.エラーチェック
    if (flag) {
        document.edit.submit();
    }

    return false;
}


/**
 * エラーメッセージを表示する
 * @param {*} form メッセージを表示する項目
 * @param {*} msg 表示するエラーメッセージ
 */
var errorElement = function (form, msg) {

    // 1.項目タグに error-form のスタイルを適用させる
    form.className = "error-form";

    // 2.エラーメッセージの追加
    // 2-1.divタグの作成
    var newElement = document.createElement("div");

    // 2-2.error のスタイルを作成する
    newElement.className = "error";

    // 2-3.エラーメッセージのテキスト要素を作成する
    var newText = document.createTextNode(msg);

    // 2-4.2-1のdivタグに2-3のテキストを追加する
    newElement.appendChild(newText);

    // 2-5.項目タグの次の要素として、2-1のdivタグを追加する
    form.parentNode.insertBefore(newElement, form.nextSibling);
}


/**
 * エラーメッセージの削除
 *   className が、設定されている要素を全件取得し、タグごと削除する
 * @param {*} className 削除するスタイルのクラス名
 */
var removeElementsByClass = function (className) {

    // 1.html内から className の要素を全て取得する
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        // 2.取得した全ての要素を削除する
        elements[0].parentNode.removeChild(elements[0]);
    }
}

/**
 * 適応スタイルの削除
 *   className を、要素から削除する
 *
 * @param {*} className
 */
var removeClass = function (className) {

    // 1.html内から className の要素を全て取得する
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        // 2.取得した要素からclassName を削除する
        elements[0].className = "";
    }
}

/**
 * メールアドレスの書式チェック
 * @param {*} val チェックする文字列
 * @returns true：メールアドレス、false：メールアドレスではない
 */
var validateMail = function (val) {

    // メールアドレスの書式が以下であるか(*は、半角英数字と._-)
    // ***@***.***
    // ***.***@**.***
    // ***.***@**.**.***
    if (val.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/) == null) {
        return false;
    } else {
        return true;
    }
}

/**
 * 電話番号のチェック
 * @param {*} val チェックする文字列
 * @returns true：電話番号、false：電話番号ではない
 */
var validateTel = function (val) {

    // 半角数値と-(ハイフン)のみであるか
    if (val.match(/^[0-9]{2,4}-[0-9]{2,4}-[0-9]{3,4}$/) == null) {
        return false;
    } else {
        return true;
    }
}

/**
 * ひらがなのチェック
 * @param {*} val チェックする文字列
 * @returns true：ひらがなのみ、false：ひらがな以外の文字がある
 */
var validateKana = function (val) {

    // ひらがな(ぁ～ん)と長音のみであるか
    if (val.match(/^[ぁ-んー]+$/) == null) {
        return false;
    } else {
        return true;
    }
}

function validateField(fieldName, value, inputElem) {
    // 他のエラーメッセージを消さないように修正

    // 該当項目の既存エラーメッセージを探す
    const oldError = inputElem.parentNode.querySelector(".error");
    if (oldError) {
        oldError.remove();  // そのフィールドのエラーだけ消す
    }
    inputElem.classList.remove("error-form");  // そのフィールドだけ

    let error = "";

    if (fieldName === "name") {
        if (value.trim() === "") {
            error = "名前が入力されていません";
        } else if (/^[\s　]+$/.test(value)) {
            error = "名前に空白だけを入力することはできません";
        } else if (/[ゐゑヰヱ]/.test(value)) {
            error = "旧仮名遣い（ゐ・ゑなど）は使用できません";
        } else if (value !== value.trim()) {
            error = "名前の前後に空白を入れないでください";
        } else if (value.length > 20) {
            error = "名前は20文字以内で入力してください";
        } else if (!/^[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FFー－〜～ー々〆〤\s]+$/.test(value)) {
            error = "入力できるのは漢字・ひらがな・カタカナのみです";
        }
        const errDiv = document.getElementById("error_name");
        if (error) {
            errDiv.textContent = error;
            inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";
            inputElem.classList.remove("error-form");
        }
        return;
    }

    if (fieldName === "kana") {
        if (value.trim() === "") {
            error = "ふりがなが入力されていません";
        } else if (/[ゐゑヰヱ]/.test(value)) {
            error = "旧仮名遣い（ゐ・ゑなど）は使用できません";
        } else if (value !== value.trim()) {
            error = "ふりがなの前後に空白を入れないでください";
        } else if (!/^[ぁ-んー]+$/.test(value)) {
            error = "ふりがなで入力してください";
        } else if (value.length > 20) {
            error = "ふりがなは20文字以内で入力してください";
        }
        const errDiv = document.getElementById("error_kana");
        if (error) {
            errDiv.textContent = error;
            inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";
            inputElem.classList.remove("error-form");
        }
        return;
    }

    if (fieldName === "postal_code") {
        const errDiv = document.getElementById("error_postal_code");

        if (value.trim() === "") {
            error = "郵便番号が入力されていません";
        } else if (!/^\d{3}-\d{4}$/.test(value)) {
            error = "郵便番号は「XXX-XXXX」の形式で入力してください";
        }

        if (error) {
            errDiv.textContent = error;
            inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";  // 正しい場合だけ消す
            inputElem.classList.remove("error-form");
        }
        return;
    }

    if (fieldName === "prefecture" || fieldName === "city_town") {
        const errDiv = document.getElementById("error_address");

        const pref = document.edit.prefecture.value.trim();
        const city = document.edit.city_town.value.trim();

        if (pref === "" || city === "") {
            error = "住所(都道府県もしくは市区町村・番地)が入力されていません";
        } else if (pref.length > 10) {
            error = "都道府県は10文字以内で入力してください";
        } else if (city.length > 50) {
            error = "市区町村・番地もしくは建物名は50文字以内で入力してください";
        }

        if (error) {
            errDiv.textContent = error;
            if (fieldName === "prefecture") inputElem.classList.add("error-form");
            if (fieldName === "city_town") inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";
            document.edit.prefecture.classList.remove("error-form");
            document.edit.city_town.classList.remove("error-form");
        }
        return;
    }

    if (fieldName === "building") {
        const errDiv = document.getElementById("error_address");
        if (value.length > 50) {
            error = "市区町村・番地もしくは建物名は50文字以内で入力してください";
            errDiv.textContent = error;
            inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";
            inputElem.classList.remove("error-form");
        }
        return;
    }

    if (fieldName === "tel") {
        if (value.trim() === "") {
            error = "電話番号が入力されていません";
        } else if (!/^0\d{1,4}-\d{1,4}-\d{3,4}$/.test(value) || value.length < 12 || value.length > 13) {
            error = "電話番号は12~13桁(例:XXX-XXXX-XXXX)で正しく入力してください";
        }
        const errDiv = document.getElementById("error_tel");
        if (error) {
            errDiv.textContent = error;
            inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";
            inputElem.classList.remove("error-form");
        }
        return;
    }

    if (fieldName === "email") {
        if (value.trim() === "") {
            error = "メールアドレスが入力されていません";
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
            error = "有効なメールアドレスを入力してください";
        } else if (value.length > 64) {
            error = "メールアドレスは64文字以内で入力してください";
        }
        const errDiv = document.getElementById("error_email");
        if (error) {
            errDiv.textContent = error;
            inputElem.classList.add("error-form");
        } else {
            errDiv.textContent = "";
            inputElem.classList.remove("error-form");
        }
        return;
    }

    if (error) {
        errorElement(inputElem, error);
    }
}


function setError(fieldId, message, force = true) {
    const errorSpan = document.getElementById(`${fieldId}Error`);
    if (!force && errorSpan.textContent) return; // 既に表示されてるなら上書きしない
    errorSpan.textContent = message;
}
