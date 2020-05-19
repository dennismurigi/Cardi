class Game{
    constructor() {
        this.cardsInDeck = [],
        this.cardsOnTable = [],
        this.ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"],
        this.suits = ["diamond", "heart", "club", "spade"],
        this.noneStarters = ["A","2","3","8","J","Q","K"],
        this.questionCards = ["Q", "8"],
        this.pickingCards = ["2", "3"],
        this.players = [],
        this.currentPlayer = {},
        this.issue = 1,
        this.route = 1,
        this.skip =  0,
        this.requested = {canRequest: false, suit: null},
        this.finish = false
    }
    
    generateDeck() {
        if(!(this.cardsInDeck.length < 1) && !(this.cardsOnTable.length < 1)){ return null; }

        this.ranks.forEach(rank => {
            this.suits.forEach(suit => {
                this.cardsInDeck.push({rank:rank, suit:suit});
            });
        });

        return this;
    }

    shuffleCards(){
        if(this.cardsInDeck.length < 1){ return null; }

        this.cardsInDeck.forEach((currentCard, index) => {
            let randomPosition = Math.floor(Math.random() * this.cardsInDeck.length);
            let randomCard = this.cardsInDeck[randomPosition];
            this.cardsInDeck[randomPosition] = this.cardsInDeck[index];
            this.cardsInDeck[index] = randomCard;
        });

        return this;
    }
    
    init(){
        if((this.cardsInDeck.length < 1) || (this.cardsOnTable.length > 1)){ return null; }

        let cardFound = false;
        while(!cardFound){
            let found = 0;
            let randomPosition = Math.floor(Math.random() * this.cardsInDeck.length);
            this.noneStarters.forEach(ns => {
                if( ns === this.cardsInDeck[randomPosition]["rank"] ){ found++;}
            });
            if(found < 1){
                this.cardsOnTable.push(this.cardsInDeck[randomPosition]);
                this.cardsInDeck.splice(randomPosition, 1);
                cardFound = true;
            }
        }

        return this;
    }
    
    issueCard(){
        if(this.cardsInDeck.length < 1 && this.cardsOnTable.length > 2){
            this.cardsInDeck = this.cardsOnTable.splice(0, this.cardsOnTable.length - 1);
            this.shuffleCards();
            this.cardsOnTable = [this.cardsOnTable[this.cardsOnTable.length -1]];
        }

        let lastCardRank = this.cardsOnTable[this.cardsOnTable.length - 1]["rank"];
        if(this.cardsInDeck.length < 1 || (this.currentPlayer.justPlayed && lastCardRank != "8" && lastCardRank != "Q") || this.currentPlayer.justPicked){
            console.log("already issued");
            return null;
        }

        for(let i = 0; i < this.issue; this.issue--){
            this.currentPlayer.cardsInHand.push(this.cardsInDeck[this.cardsInDeck.length - 1]);
            this.cardsInDeck.splice(this.cardsInDeck.length - 1, 1);
            console.log("issued a card");
        }

        this.issue = 1;
        this.currentPlayer.justPicked = true;

        return this;
    }

    acceptCard(index){
        this.cardsOnTable.push(this.currentPlayer.cardsInHand[index]);
        this.currentPlayer.cardsInHand.splice(index, 1);
        this.currentPlayer.justPlayed = true;

        return this;   
    }

    isASpecialCard(specialRanks){
        let found = 0;
        specialRanks.forEach(rank => {
            if(rank === this.cardsOnTable[this.cardsOnTable.length - 1]["rank"]){
                found++;
            }
        });
        if(found > 0){ 
            return true;
        }else{
            return false;
        }
    }

    isAQuestionCardMatch(aspiringCard){
        let lastCard = this.cardsOnTable[this.cardsOnTable.length - 1];

        if(this.isASpecialCard(this.questionCards) && aspiringCard["rank"] != "K" && aspiringCard["rank"] != "J" && (lastCard["rank"] === aspiringCard["rank"] || lastCard["suit"] === aspiringCard["suit"])){ 
            return true;
        }else{
            return false;
        }

    }

    isAPickingCardMatch(aspiringCard){
        let lastCard = this.cardsOnTable[this.cardsOnTable.length - 1];

        if(this.isASpecialCard(this.pickingCards) && (lastCard["rank"] === aspiringCard["rank"] || aspiringCard["rank"] === "A")){
            return true;
        }else{
            return false;
        }
    }

    isARequestedCard(){
        if(this.requested.suit === null){
            return false;
        }else{
            return true;
        }
    }

    isARequestedCardMatch(aspiringCard){
        if(this.isARequestedCard() && (aspiringCard["suit"] === this.requested || aspiringCard["rank"] === "A")){
            return true;
        }else{
            return false;
        }
    }

    isPlayable(index){
        if( !(typeof(index) === "number") || index > (this.currentPlayer.cardsInHand.length - 1) || isNaN(index) ){return false;}

        let lastCard = this.cardsOnTable[this.cardsOnTable.length - 1];
        let aspiringCard = this.currentPlayer.cardsInHand[index];

        if(!this.isARequestedCard() && this.isAQuestionCardMatch(aspiringCard)){
            console.log("matched question");
            return true;
        }else if(!this.isARequestedCard() && this.currentPlayer.justPlayed && aspiringCard["rank"] === lastCard["rank"]){
            console.log("current player has played and ranks are similar");
            return true;
        }else if(!this.isARequestedCard() && !this.currentPlayer.justPlayed && this.isAPickingCardMatch(aspiringCard)){
            console.log("current player has not played and its a 2/3");
            return true;
        }else if(!this.currentPlayer.justPlayed && this.isARequestedCardMatch(aspiringCard)){
            this.requested.suit = null;
            console.log("player has not played and there is a requested card");
            return true;
        }else if(!this.currentPlayer.justPlayed && this.issue <= 1 && !this.isARequestedCard() && (lastCard["rank"] == aspiringCard["rank"] || lastCard["suit"] == aspiringCard["suit"])){
            console.log("player had not played and ranks or suits match");
            return true;
        }else{
            console.log("refuse");
            return false;
        }
    }

    addNewPlayer(playerId){
        this.players.push({playerId:playerId, points:0, cardsInHand: [], justPlayed: false, justPicked: false, cardie:false});
        return this;
    }

    getPlayerIndex(playerId){
        return this.players.findIndex(player => playerId === player.playerId);
    }

    getPlayer(playerId){
        return this.players[this.getPlayerIndex(playerId)];
    }

    setCurrentPlayer(playerIndex){
        this.currentPlayer.justPlayed = false;
        this.currentPlayer.justPicked = false;
        this.skip = 0;
        this.requested.canRequest = false;
        this.currentPlayer = this.players[playerIndex]; 

        return this;
    }

    requestSuit(requestedSuit){
        let found = 0;
        this.suits.forEach(suit => {
            if(suit == requestedSuit){
                found++;
            }
        });
        if(found < 1 || !this.requested.canRequest){return null;}
        this.requested.suit = requestedSuit;
    }

    callCardie(playerId){
        if((playerId !== this.currentPlayer["playerId"])){return null;}
        if(this.currentPlayer.cardie){
            this.currentPlayer.cardie = false;
        }else{
            this.currentPlayer.cardie = true;
        }    
    }

    goToNextPlayer(playerId){
        if((playerId !== this.currentPlayer["playerId"])){return null;}

        this.issueCard();

        let nextPlayer;
        if(this.route < 0){
            nextPlayer = this.getPlayerIndex(this.currentPlayer.playerId) - this.skip - 1;
            console.log("reverse route skip " + this.skip);
        }else{
            nextPlayer = this.getPlayerIndex(this.currentPlayer.playerId) + this.skip + 1 ;
            console.log("forward route skip " + this.skip);
        }

        while(nextPlayer > this.players.length -1){
            nextPlayer -= this.players.length;
            console.log("finding +");
        }
        while(nextPlayer < 0){
            nextPlayer += this.players.length;
            console.log("finding -");
        }
        
        this.setCurrentPlayer(nextPlayer);

        return this;
    }

    setPlay(issue = 1, skip = 0, route = 1, points = 2, canFinish = false){
        this.issue = issue;
        this.skip += skip;
        this.route *= route;
        this.currentPlayer.points += points;
        
        if(canFinish && this.currentPlayer.cardie && this.currentPlayer.cardsInHand.length > 2){
            this.currentPlayer.points += 100;
            this.finish = true;
        }

        if(this.currentPlayer.cardie && !this.finish){
            this.currentPlayer.points -= 5;
        }
    }

    play(index, playerId){
        if((playerId !== this.currentPlayer["playerId"]) || !this.isPlayable(index) || this.currentPlayer.justPicked || this.finish){ return null; }

        let aspiringCard = this.currentPlayer.cardsInHand[index];
        if(aspiringCard["rank"] === "A" && this.issue > 1){
            this.setPlay(0, 0, 1, 0);
        }else if(aspiringCard["rank"] === "A" && this.issue <= 1){
            //ask for card
            this.requested.canRequest = true;
            this.setPlay(1, 0, 1, 6);
        }else if(aspiringCard["rank"] === "2" || aspiringCard["rank"] === "3"){
            this.setPlay(this.issue + parseInt(aspiringCard["rank"]), 0, 1, 5);   
        }else if(aspiringCard["rank"] === "J"){
            this.setPlay(1, 1, 1, 3);
        }else if(aspiringCard["rank"] === "K"){
            this.setPlay(1, 0, -1, 2);
        }else{
            this.setPlay(1, 0, 1, 4, true);
        }

        this.acceptCard(index);
    }
}