// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image
// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";

let model, webcam, newImg, objectContainer, labelContainer, maxPredictions;
labelContainer = document.getElementById("label-container");
objectContainer = document.getElementById("object-container");

// 클래스 배열: 0, 2번 궤양병. 3번 귤응애. 5번 진딧물
// 0번: 궤양병, 1번: 귤응애, 2번: 진딧물
// 설명의 출처는 농사로(https://www.nongsaro.go.kr/portal/portalMain.ps)이다.
const classExplanation = [
    "잎, 가지, 열매에 발생하며 반점 형태로 외관을 해치고 심할 경우에는 잎이 뒤틀리며 낙엽이 되며 새순의 경우 순 전체가 죽고 과실은 낙과 될 수도 있다."
    + "<br>감염 7~10일 후에 첫 병징이 보이기 시작하며 초기 증상은 주위가 황화된 매우 작은 반점(직경 약 0.3 ㎜~0.5 ㎜)으로부터 시작하여<br>병이 진전되면서 "
    + "점차 그 크기가 커지고 모양도 원형에서 불규칙한 모양으로 발전되며 잎의 양면, 특히 잎의 뒷면이 부풀어 오르고<br>나중에 이 부분이 코르크화 되며 분화구 모양이 된다."
    + "<br><a href=\"https://www.nongsaro.go.kr/portal/ps/pss/pssa/sicknsSearchDtl.ps?pageIndex=1&pageSize=10&&sicknsCode=D00000033&menuId=PS00202\">더 자세한 정보</a>",
    "약충과 성충이 잎과 과실에 기생하여 조직 내의 세포액이나 엽록소를 흡수한다. <br>피해 받은 잎은 잎 표면에 바늘로 찌른 듯한 하얀 반점이 나타난다.<br>" 
    + "엽록소가 파괴되어 동화작용이 저하되고 흡즙한 상처부위부터 수분이 증산되어 생리기능이 현저히 떨어진다.<br>피해가 심한 경우에는 잎이 백화 되면서 조기낙엽을 초래하기도 한다."
    + "<br><a href=\"https://www.nongsaro.go.kr/portal/ps/pss/pssa/hlsctSearchDtl.ps?pageIndex=1&pageSize=10&&hlsctCode=H00000616&menuId=PS00202\">더 자세한 정보</a>",
    "감귤 진딧물은 감귤이 연한 기간의 충해 일종이고, 성충은 오래된 잎과 여린 잎 위에서 빨아먹고 산다.<br>약충은 감귤 신초에 모이며, 어린잎을 흡즙하여 손상을 준다.<br>"
    + "피해를 입은 어린 새싹은 말라 시들고, 새 잎은 기형적으로 비틀어져 떨어지기 쉬우며, 약충은 나뭇가지와 잎 위에 배설물을 살포해서 광합 작용에 영향을 주고 그으름병을 야기 할 수 있다."
    + "<br><a href=\"http://www.nongsaro.go.kr/portal/search/nongsaroSearch.ps?categoryName=SCH01&menuId=PS00007&option=1&sortOrdr=01&searchWord=%EC%A7%84%EB%94%A7%EB%AC%BC\">더 자세한 정보</a>",
];
const classN = ["열매-궤양병", "열매-정상", "잎-궤양병", "잎-귤응애", "잎-정상", "잎-진딧물"];

//웹캠이 켜져있는가?
let isWebcam = false;

// load the model and metadata
// Refer to tmImage.loadFromFiles() in the API to support files from a file picker
// or files from your local hard drive
// Note: the pose library adds "tmImage" object to your window (window.tmImage)

async function init(){
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    return;
}

// Load the image model and setup the webcam
async function initWebcam() {
    if (isWebcam) return;

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);
    isWebcam = true;

    // append elements to the DOM
    objectContainer.innerHTML ='';
    objectContainer.appendChild(webcam.canvas);
}

async function loop() {
    if (!isWebcam) return;
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    let prediction;
    let classPrediction = "식별 불가";

    if (isWebcam) {
        prediction = await model.predict(webcam.canvas);

        for (let i = 0; i < maxPredictions; i++) {
            // 기존 코드
            // classPrediction +=
            //     "<br>" + prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    
            // 변경한 코드
            if (prediction[i].probability.toFixed(2) > 0.59){
                classPrediction = explanation(i);
            }
        }
    }
    else {
        var classChance = [0,0,0,0,0,0];
        for (let i = 0; i < 5; i++){
            prediction = await model.predict(newImg);
            for (let i = 0; i < maxPredictions; i++) {
                classChance[i] += parseFloat(prediction[i].probability.toFixed(2));
            }
        }

        const maxChance = Math.max(...classChance);
        const maxIndex = classChance.indexOf(maxChance);
        classPrediction = explanation(maxIndex);
        
        // 디버깅용
        // for (let i = 0; i < maxPredictions; i++) {
        // classPrediction +=
        //     "<br>" + classN[i] + ": " + String(classChance[i]);
        // }
    }

    labelContainer.innerHTML = classPrediction;
}

//이미지 업로드 버튼
const fileInput = document.getElementById("imgUpload");

const initImg = (e) => {
  const selectedFile = [...fileInput.files];
  const fileReader = new FileReader();

  fileReader.readAsDataURL(selectedFile[0]);

  fileReader.onload = async function () {
    isWebcam = false;
    newImg = document.createElement("img");
    newImg.src = fileReader.result;
    await predict();

    newImg.width = 200;
    newImg.height = 200;
    objectContainer.innerHTML ='';
    objectContainer.appendChild(newImg);
  };
};

fileInput.addEventListener("change", initImg);

//설명 수정하는 함수
function explanation(index){
    var exp = classN[index] + "<br>";
    if (index == 0 || index == 2) exp += classExplanation[0];
    else if (index == 3) exp += classExplanation[1];
    else if (index == 5) exp += classExplanation[2];
    return exp;
}