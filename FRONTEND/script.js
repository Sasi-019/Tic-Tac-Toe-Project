let boxes = document.querySelectorAll(".box");
let arrayIndex=new Array(9).fill("")
let turn =0
let win =false
const body = document.querySelector("body")
const player = document.querySelector("#player")
boxes.forEach(box => {

    box.addEventListener("click", () => {
        if(box.innerText !=="O" && box.innerText !=="X" && win === false){
        let index=0
        let output=' '
        turn+=1
        if(turn%2 === 1)
           { box.innerText="O"
               index = box.dataset.index;
               output="O"
           }
        else{
            box.innerText="X"
            index = box.dataset.index;
            output="X"
        }
     winner(index,output,turn)
    }
      
    });
});
winningSet=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
function winner(x,y,turn){
   arrayIndex[x]=y
 
   let i =0

    for(i=0;i<8;i++ )
    {   
        if( arrayIndex[winningSet[i][0]] !== "" && arrayIndex[winningSet[i][0]]===arrayIndex[winningSet[i][1]] && arrayIndex[winningSet[i][1]]===arrayIndex[winningSet[i][2] ])
                  {  console.log("Winner")
                      win =true
                      setTimeout(() =>{alert(`player ${(turn+1)%2 +1} won `)},2000)
                      setTimeout(() =>{  body.textContent ="Restart the game"},4000)
                    

                  }
                       
       if(turn%2 === 0)
                       {
                        console.log("Player 2 ")
                        player.textContent = "player 2 playing"
                        
                       }
                    else
                      {  console.log("Player 1")
                        
                       player.textContent = "player 1 playing"
                        
                    }
                    }             
            
        console.log(arrayIndex)
       
    }
 

                      

