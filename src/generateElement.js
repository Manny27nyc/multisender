// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export default function generateElement(msg){
  let errorNode = document.createElement("div");
  errorNode.innerHTML = `${msg}`;
  return errorNode;
}