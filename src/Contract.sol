// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

pragma solidity ^0.8.0;

contract Blog {
    string public name;
    address public owner;

    uint private _postId;

    struct Post {
      uint id;
      string title;
      string content;
      bool published;
    }
    /* mappings can be seen as hash tables */
    /* here we create lookups for posts by id and posts by ipfs hash */
    mapping(uint => Post) private idToPost;
    mapping(string => Post) private hashToPost;
    mapping(uint => address) private postCreator;

    /* events facilitate communication between smart contractsand their user interfaces  */
    /* i.e. we can create listeners for events in the client and also use them in The Graph  */
    event PostCreated(uint id, string title, string hash);
    event PostUpdated(uint id, string title, string hash, bool published);

    /* when the blog is deployed, give it a name */
    /* also set the creator as the owner of the contract */
    constructor(string memory _name) {
        name = _name;
        owner = msg.sender;
    }

    /* updates the blog name */
    function updateName(string memory _name) public {
        name = _name;
    }

    /* transfers ownership of the contract to another address */
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    /* fetches an individual post by the content hash */
    function fetchPost(string memory hash) public view returns(Post memory){
      return hashToPost[hash];
    }

    /* creates a new post */
    function createPost(string memory title, string memory hash) public {
        _postId = _postId + 1;
        Post storage post = idToPost[_postId];
        post.id = _postId;
        post.title = title;
        post.published = true;
        post.content = hash;
        postCreator[_postId] = msg.sender;
        hashToPost[hash] = post;
        emit PostCreated(_postId, title, hash);
    }

    /* updates an existing post */
    function updatePost(uint postId, string memory title, string memory hash, bool published) public onlyPostCreator(postId) {
        // The `onlyPostCreator` modifier ensures that only the creator of the post can invoke this function
        Post storage post =  idToPost[postId];
        post.title = title;
        post.published = published;
        post.content = hash;
        idToPost[postId] = post;
        hashToPost[hash] = post;
        emit PostUpdated(post.id, title, hash, published);
    }

    /* fetches all posts */
    function fetchPosts() public view returns (Post[] memory) {
        uint itemCount = _postId;

        Post[] memory posts = new Post[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            uint currentId = i + 1;
            Post storage currentItem = idToPost[currentId];
            posts[i] = currentItem;
        }
        return posts;
    }

    /* this modifier means only the creator of the post can */
    /* invoke the function */
    modifier onlyPostCreator(uint postId) {
     require(msg.sender == postCreator[postId]);
    _;
  }

    /* this modifier means only the contract owner can */
    /* invoke the function */
    modifier onlyOwner() {
      require(msg.sender == owner);
    _;
  }
}