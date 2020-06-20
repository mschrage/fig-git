// Fig commands to talk to primitive
fig.init = (input) => {

  determineIfGitExists()

}

let determineIfGitExists = () => {
  var gitStatusErrorMessage = "fatal: not a git repository (or any of the parent directories): .git"

  fig.execute(`git status`, (data, error) => {
    console.log("response to git status")
    console.log(data)

    if (data.startsWith("fatal:")) {
      app.error = true;
      app.errorMessage = data;
    } else {
      getGitInfo()
    }

  })
}

let getGitInfo = () => {
  gitBranch()
  gitRemote()
  gitLog()
  gitStatus()
  gitRepoDirectory()
}

// Get top level directory for repo

let gitRepoDirectory = () => {
  fig.execute(`git rev-parse --show-toplevel`, (data) => {
    app.repoPath = data.trim()
    console.log(app.repoPath, data)
  })
} 


// ### Get the local branches ###

let gitBranch = () => {
  fig.execute(`git branch`, (data, error) => {

    data = data.split("\n").filter(branch => branch.trim() !== "")
    app.branches = data.map(branch => {

      branch = branch.trim()

      // If the branch has "* " in it, it is the current branch the user is on
      if (branch.includes("* ")) {
        branch = branch.slice(2)

        app.selectedBranch = branch

        return branch
      }
      return branch
    });
  });
}

// ### Get the remote repos ###

let gitRemote = () => {
  fig.execute(`git remote`, (data, error) => {

    data = data.split("\n").filter(remote => remote.trim() !== "")

    app.remotes = data.map((remote, idx) => {

      remote = remote.trim()

      if (idx === 0) app.selectedRemote = remote

      return remote
    });
  });
}




// ### Get the commit history ###
let gitLog = () => {
  // git log --pretty=format:"[%h, %an, %ae, %cr, %ct, %d, %B]"

  // MUST USE CRAZY DELIMTER between each value in array and each array
  // A7A7A7A8A7 is a 
  // B7B7B7B8B7 is a delimter for each object in array

  let commitDelim = "A7A7A7A8A7" // delimter for each commit
  let valueDelim = "B7B7B7B8B7 "  // delimter for each object we receive in commit

  fig.execute(`git log --pretty=format:"${commitDelim}%h${valueDelim}%an${valueDelim}%ae${valueDelim}%cr${valueDelim}%ct${valueDelim}%B"`, (data, error) => {

    // Create array of commits (array of strings)
    var tempCommitHistory = data.split(commitDelim).filter(commit => commit.trim() !== "")

    // Loop through array of commit strings and make array of commit arrays
    app.commitHistory = tempCommitHistory.map(individualCommit => {

      individualCommit = individualCommit.trim()

      individualCommitArray = individualCommit.split(valueDelim).filter(interiorElem => interiorElem.trim() !== "")

      individualCommitArray = individualCommitArray.map(interiorElem => {
        return interiorElem.trim()
      })

      var individualCommitDictionary = {
        hash: individualCommitArray[0],
        authorName: individualCommitArray[1],
        authorEmail: individualCommitArray[2],
        timeRelative: individualCommitArray[3],
        timeUnix: individualCommitArray[4],
        message: individualCommitArray[5],
        hover: false
      }

      return individualCommitDictionary
    })

  });
}


// ### Get staging data ###

let gitStatus = () => {
  var status = ""

  fig.stream(`git status --porcelain`, (data, error) => {

    if (data) { 
      status += data + '\n'
      return
    }

    console.log("called git status --porcelain")
    console.log("response:")
    console.log(status)

    let rows = status.split("\n").filter(row => row.trim() !== "")

    console.log("rows: ")
    console.log(rows)

    app.filesForStaging = rows.map(row => {

      var stage = row.slice(0, 3).trim()
      var fileName = row.slice(3)

      return { stage: stage, name: fileName, descriptor: DESCRIPTIONS[stage] || "", hover: false, color: COLORS[stage] || "" }

    })
    console.log("files for staging: ")
    console.log(app.filesForStaging)

    app.selectedFiles = app.filesForStaging.map(file => file.name)

  });
}

var DESCRIPTIONS = {
  ' ': 'Unmodified',
  'M': 'Modified',
  'A': 'Added',
  'D': 'Deleted',
  'R': 'Renamed',
  'C': 'Copied',
  'U': 'Umerged',
  '??': 'Untracked',
  '!': 'Ignored'
};

var COLORS = {
  ' ': 'Unmodified',
  'M': 'orange',
  'A': 'green',
  'D': 'red',
  'R': 'green',
  'C': 'gray',
  'U': 'gray',
  '??': 'orange',
  '!': 'red'
};


// // SCHRAGE PRE-WRITTEN FUNCTIONS

// //https://github.com/jamestalmage/parse-git-status/blob/master/index.js
// function parseStatus(str) {
//     var chunks = str.split('\n');
//     var ret = [];
//     for (var i = 0; i < chunks.length; i++) {
//         var chunk = chunks[i];
//         if (chunk.length) {
//             var x = chunk[0];
//             var fileStatus = {
//                 x: x,
//                 y: chunk[1],
//                 to: chunk.substring(3),
//                 from: null
//             };
//             if (x === 'R') {
//                 i++;
//                 fileStatus.from = chunks[i];
//             }
//             ret.push(fileStatus);
//         }
//     }
//     return ret;
// }
