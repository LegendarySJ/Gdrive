// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract upload{
    struct Access{
        address user;//user with access
        bool access; //true or false
    }
    mapping (address => string[]) value; //url of the images
    mapping (address => mapping (address => bool)) ownership; //access given or not
    mapping (address => Access[]) AccessList; // information of user with access
    mapping (address => mapping (address => bool)) previousData; //information of previous state

    function add(address _user,string memory url) external {
        value[_user].push(url);
    }// function to add images
    function allow(address user) external {
        ownership[msg.sender][user] = true;
        if(previousData[msg.sender][user]){
            for(uint i=0;i<AccessList[msg.sender].length;i++){
                if(AccessList[msg.sender][i].user==user){
                    AccessList[msg.sender][i].access=true; 
                }
            }
        }
        else{
            AccessList[msg.sender].push(Access(user,true));  
            previousData[msg.sender][user]=true; 
        }// function to allow access to users and check if previously given access or not
    }
    function disallow(address user) public{
        ownership[msg.sender][user]=false;
        for(uint i=0;i<AccessList[msg.sender].length;i++){
            if(AccessList[msg.sender][i].user==user){ 
                AccessList[msg.sender][i].access=false;  
            }
        }
    }// function to revoke access from user
    function display(address _user) external view returns(string[] memory){
        require(_user == msg.sender || ownership[_user][msg.sender],"You don't have access");//check access
        return (value[_user]);
    } 
    function shareAccess() public  view returns (Access[] memory){
        return AccessList[msg.sender];
    }
}
    