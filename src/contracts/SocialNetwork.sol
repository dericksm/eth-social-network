pragma solidity >=0.5.0;

contract SocialNetwork {
    string public name;
    uint public postCount = 0;
    mapping(uint => Post) public posts;

    struct Post {
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public {
        name = "Derick | Social Network";
    }

    function createPosts(string memory _content) public {
        //validation of content (must not be empty)
        require(bytes(_content).length > 0);
        postCount ++;
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint _id) public payable {
        //Post index validation
        require(_id > 0 && _id <= postCount);
        //Fetch the post
        Post memory _post = posts[_id];
        //Identify the post author
        address payable _author = _post.author;
        //Send the tip to the author
        address(_author).transfer(msg.value);
        //Increase the post tip amount
        _post.tipAmount = _post.tipAmount + msg.value;
        posts[_id] = _post;
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }

}