/**
 * Functionality Page - User Stories Display
 * @version 0.2.0
 */

document.addEventListener('DOMContentLoaded', loadUserStories);

function loadUserStories() {
    fetch('data/user-stories.json')
        .then(response => response.json())
        .then(data => renderUserStories(data.userStories))
        .catch(error => {
            console.error('Error loading user stories:', error);
            document.getElementById('stories-container').innerHTML = 
                '<div class="error">Failed to load user stories. Please try again.</div>';
        });
}

function renderUserStories(stories) {
    const container = document.getElementById('stories-container');
    container.innerHTML = '';

    const completedStories = stories.filter(s => s.status === 'completed');
    const inProgressStories = stories.filter(s => s.status === 'in-progress');
    const plannedStories = stories.filter(s => s.status === 'planned');

    if (completedStories.length > 0) {
        container.appendChild(renderSection('✅ Completed Features', completedStories));
    }
    if (inProgressStories.length > 0) {
        container.appendChild(renderSection('🚧 In Progress', inProgressStories));
    }
    if (plannedStories.length > 0) {
        container.appendChild(renderSection('📅 Planned Features', plannedStories));
    }

    // Summary stats
    updateStats(stories);
}

function renderSection(title, stories) {
    const section = document.createElement('section');
    section.className = 'stories-section';
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    section.appendChild(heading);

    const storiesGrid = document.createElement('div');
    storiesGrid.className = 'stories-grid';

    stories.forEach(story => {
        storiesGrid.appendChild(renderStoryCard(story));
    });

    section.appendChild(storiesGrid);
    return section;
}

function renderStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    
    const header = document.createElement('div');
    header.className = 'story-header';
    
    const titleContainer = document.createElement('div');
    titleContainer.className = 'story-title-container';
    
    const id = document.createElement('span');
    id.className = 'story-id';
    id.textContent = story.id;
    titleContainer.appendChild(id);
    
    const title = document.createElement('h3');
    title.className = 'story-title';
    title.textContent = story.title;
    titleContainer.appendChild(title);
    
    header.appendChild(titleContainer);
    
    const icon = document.createElement('span');
    icon.className = 'story-icon';
    icon.textContent = story.icon;
    header.appendChild(icon);
    
    card.appendChild(header);

    const description = document.createElement('p');
    description.className = 'story-description';
    description.innerHTML = `<strong>Goal:</strong> ${story.goal}`;
    card.appendChild(description);

    const versionBadge = document.createElement('span');
    versionBadge.className = 'version-badge';
    versionBadge.textContent = `v${story.version}`;
    card.appendChild(versionBadge);

    if (story.features && story.features.length > 0) {
        const featuresList = document.createElement('ul');
        featuresList.className = 'features-list';
        
        story.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
        
        card.appendChild(featuresList);
    }

    return card;
}

function updateStats(stories) {
    const totalStories = stories.length;
    const completedCount = stories.filter(s => s.status === 'completed').length;
    const completionPercentage = Math.round((completedCount / totalStories) * 100);

    document.getElementById('total-stories').textContent = totalStories;
    document.getElementById('completed-stories').textContent = completedCount;
    document.getElementById('completion-percentage').textContent = completionPercentage + '%';
}
