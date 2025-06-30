// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
