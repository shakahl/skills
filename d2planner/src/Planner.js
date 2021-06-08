import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import './Planner.css';
import skillData from './assets/1.14D/game_data/d2_skill_data.json';
import stateToBuildString, { buildStringToState } from './buildStrings'
import CharacterSelector from './CharacterSelector';
import DifficultySelector from './DifficultySelector';
import Tooltip from './Tooltip';
import Tree from './Tree';

const  history = createBrowserHistory();

class Planner extends Component {
  constructor (props) {
    super(props);
    const initialState = {
      character: 'sorceress',
      currentTab: 1,
      currentSkill: 'fireBolt',
      difficulty: 'Normal',
      difficultyAuto: true,
      ...getEmptySkillLevels(skillData),
      ...getEmptySkillBonuses(skillData),
    };
    const { buildString } = props.match.params;
    this.state = {
      ...initialState,
      ...buildStringToState(buildString, skillData.tree),
    };
  }

  setTab = (id) => this.setState({
    currentTab: id,
    currentSkill: skillData.tree[this.state.character][id].skills[0].skillName,
  });
  setCharacter = (character) => this.setState({
    character: character,
    currentTab: 1,
    currentSkill: skillData.tree[character][1].skills[0].skillName,
  });
  setSkillLevels = (character, skillLevels) => this.setState({[`${character}SkillLevels`]: skillLevels});
  setSkillBonuses = (character, skillBonuses) => this.setState({[`${character}SkillBonuses`]: skillBonuses});
  setCurrentSkill = (skillName) => this.setState({currentSkill: skillName});
  setDifficulty = (difficulty) => this.setState({difficulty: difficulty});
  setDifficultyAuto = (difficultyAuto) => this.setState({difficultyAuto: difficultyAuto});

  render() {
    history.push(stateToBuildString(this.state, skillData.skillDetails));
    const characterLevel = estimateCharacterLevel(
      this.state[`${this.state.character}SkillLevels`],
      skillData.skillDetails,
      this.state.difficulty,
    )
    return (
      <div className='plannerContainer'>
        <CharacterSelector
          character={this.state.character}
          setCharacter={this.setCharacter}
        />
        <hr></hr>
        <div className='plannerCoreContainer'>
          <Tooltip
            skill={skillData.skillDetails[this.state.currentSkill]}
            skillLevels={this.state[`${this.state.character}SkillLevels`]}
            skillBonuses={this.state[`${this.state.character}SkillBonuses`]}
            difficulty={this.state.difficulty}
          />
          <div className='treeWithOptionsContainer'>
            <Tree
              skillLevels={this.state[`${this.state.character}SkillLevels`]}
              skillBonuses={this.state[`${this.state.character}SkillBonuses`]}
              treeData={skillData.tree[this.state.character]}
              character={this.state.character}
              characterLevel={characterLevel}
              currentSkill={this.state.currentSkill}
              currentTab={this.state.currentTab}
              synergies={skillData.skillDetails[this.state.currentSkill].synergies || []}
              setTab={this.setTab}
              setSkillLevels={this.setSkillLevels}
              setSkillBonuses={this.setSkillBonuses}
              setCurrentSkill={this.setCurrentSkill}
            />
            <DifficultySelector
              difficulty={this.state.difficulty}
              difficultyAuto={this.state.difficultyAuto}
              setDifficulty={this.setDifficulty}
              setDifficultyAuto={this.setDifficultyAuto}
            />
          </div>
        </div>
      </div>
    );
  };
};

function estimateCharacterLevel (skillLevels, skillData, difficulty) {
  const questSkills = {'Normal': 4, 'Nightmare': 8, 'Hell': 12}[difficulty];
  let levelFromPoints = 1;
  let levelFromReqs = 1;
  for (const [skillName, lvl] of Object.entries(skillLevels)) {
    const skillRequiredLevel = lvl + skillData[skillName].reqLevel - 1;
    levelFromReqs = Math.max(levelFromReqs, skillRequiredLevel);

    levelFromPoints += lvl;
  }
  levelFromPoints = Math.max(1, levelFromPoints - questSkills);
  return Math.max(levelFromReqs, levelFromPoints);
}

function getEmptySkillLevels (skillData) {
  let skillLevels = {};
  Object.keys(skillData.tree).forEach((character) => {
    skillLevels[`${character}SkillLevels`] = {};
  });
  return skillLevels;
}

function getEmptySkillBonuses (skillData) {
  let skillLevels = {};
  Object.keys(skillData.tree).forEach((character) => {
    skillLevels[`${character}SkillBonuses`] = {};
  });
  return skillLevels;
}

export default withRouter(Planner);
