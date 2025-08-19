import pandas as pd
import numpy as np
from scipy import stats
from sklearn.preprocessing import LabelEncoder
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')

class UniversalDataClassifier:
    def __init__(self):
        self.classification_rules = self._initialize_classification_rules()
        
    def _initialize_classification_rules(self):
        """Initialize classification rules for different data types and ML approaches"""
        
        rules = {
            'target_detection': {
                'binary_classification': {
                    'unique_values': 2,
                    'confidence_boost': 0.3,
                    'suitable_dtypes': ['int64', 'float64', 'object', 'bool']
                },
                'multiclass_classification': {
                    'unique_values_range': (3, 20),
                    'max_unique_ratio': 0.1,
                    'confidence_boost': 0.2,
                    'suitable_dtypes': ['int64', 'float64', 'object']
                },
                'regression': {
                    'min_unique_ratio': 0.05,
                    'min_unique_values': 10,
                    'confidence_boost': 0.1,
                    'suitable_dtypes': ['int64', 'float64']
                }
            },
            'unsupervised_triggers': {
                'no_suitable_targets': 0.8,
                'high_dimensionality': 0.6,
                'exploratory_analysis': 0.7
            },
            'data_quality_thresholds': {
                'max_missing_ratio': 0.5,
                'min_variance_threshold': 0.01,
                'max_constant_features_ratio': 0.1
            },
            'complexity_indicators': {
                'high_dimensionality_threshold': 100,
                'large_dataset_threshold': 100000,
                'categorical_encoding_threshold': 50
            }
        }
        
        return rules
    
    def classify_data(self, data, sample_size=1000):
        """Main method to classify unknown data and recommend ML approaches"""
        
        # Sample data if too large
        if len(data) > sample_size:
            data_sample = data.sample(n=sample_size, random_state=42)
        else:
            data_sample = data.copy()
        
        # Comprehensive analysis
        analysis = {
            'basic_stats': self._basic_statistical_analysis(data_sample),
            'column_analysis': self._analyze_each_column(data_sample),
            'relationship_analysis': self._analyze_relationships(data_sample),
            'temporal_analysis': self._check_temporal_patterns(data_sample),
            'target_detection': self._detect_potential_targets(data_sample)
        }
        
        # Generate recommendations
        recommendations = self._generate_comprehensive_recommendations(analysis)
        
        return {
            'analysis': analysis,
            'recommendations': recommendations,
            'confidence_scores': self._calculate_confidence_scores(analysis, recommendations)
        }
    
    def _basic_statistical_analysis(self, data):
        """Basic statistical analysis of the dataset"""
        return {
            'shape': data.shape,
            'memory_usage': data.memory_usage(deep=True).sum(),
            'dtypes_summary': data.dtypes.value_counts().to_dict(),
            'missing_data': {
                'total_missing': data.isnull().sum().sum(),
                'missing_ratio': data.isnull().sum().sum() / (data.shape[0] * data.shape[1]),
                'columns_with_missing': data.columns[data.isnull().any()].tolist()
            },
            'duplicate_rows': data.duplicated().sum(),
            'numeric_summary': data.describe() if len(data.select_dtypes(include=[np.number]).columns) > 0 else None
        }
    
    def _analyze_each_column(self, data):
        """Detailed analysis of each column"""
        column_analysis = {}
        
        for column in data.columns:
            col_data = data[column].dropna()
            
            analysis = {
                'dtype': str(data[column].dtype),
                'unique_count': data[column].nunique(),
                'unique_ratio': data[column].nunique() / len(data),
                'missing_count': data[column].isnull().sum(),
                'missing_ratio': data[column].isnull().sum() / len(data),
                'is_constant': data[column].nunique() <= 1,
                'is_binary': data[column].nunique() == 2,
            }
            
            # Type-specific analysis
            if pd.api.types.is_numeric_dtype(col_data):
                analysis.update(self._analyze_numeric_column(col_data))
            elif pd.api.types.is_datetime64_any_dtype(col_data):
                analysis.update(self._analyze_datetime_column(col_data))
            else:
                analysis.update(self._analyze_categorical_column(col_data))
            
            # Target suitability assessment
            analysis['target_suitability'] = self._assess_target_suitability(col_data, analysis)
            
            column_analysis[column] = analysis
        
        return column_analysis
    
    def _analyze_numeric_column(self, column_data):
        """Analyze numeric column characteristics"""
        return {
            'mean': column_data.mean(),
            'std': column_data.std(),
            'min': column_data.min(),
            'max': column_data.max(),
            'skewness': column_data.skew(),
            'kurtosis': column_data.kurtosis(),
            'has_negative': (column_data < 0).any(),
            'has_zeros': (column_data == 0).any(),
            'is_integer_like': column_data.apply(lambda x: float(x).is_integer()).all(),
            'distribution_type': self._detect_distribution_type(column_data)
        }
    
    def _analyze_datetime_column(self, column_data):
        """Analyze datetime column characteristics"""
        try:
            datetime_col = pd.to_datetime(column_data)
            return {
                'date_range': {
                    'start': datetime_col.min(),
                    'end': datetime_col.max(),
                    'span_days': (datetime_col.max() - datetime_col.min()).days
                },
                'frequency_detected': pd.infer_freq(datetime_col.sort_values()),
                'has_time_component': datetime_col.dt.time.nunique() > 1,
                'temporal_patterns': self._detect_temporal_patterns(datetime_col)
            }
        except:
            return {'analysis_error': 'Could not parse as datetime'}
    
    def _analyze_categorical_column(self, column_data):
        """Analyze categorical column characteristics"""
        value_counts = column_data.value_counts()
        return {
            'most_frequent_value': value_counts.index[0] if len(value_counts) > 0 else None,
            'most_frequent_count': value_counts.iloc[0] if len(value_counts) > 0 else 0,
            'value_distribution': value_counts.head(10).to_dict(),
            'is_high_cardinality': column_data.nunique() > 50,
            'has_numeric_strings': self._check_numeric_strings(column_data),
            'avg_string_length': column_data.astype(str).str.len().mean()
        }
    
    def _detect_distribution_type(self, column_data):
        """Detect the distribution type of numeric data"""
        try:
            # Simple distribution detection
            if column_data.nunique() == 2:
                return 'binary'
            elif (column_data >= 0).all() and column_data.dtype == 'int64':
                return 'count_like'
            elif abs(column_data.skew()) < 0.5:
                return 'normal_like'
            elif column_data.skew() > 1:
                return 'right_skewed'
            elif column_data.skew() < -1:
                return 'left_skewed'
            else:
                return 'unknown'
        except:
            return 'analysis_error'
    
    def _detect_temporal_patterns(self, datetime_col):
        """Detect temporal patterns in datetime data"""
        try:
            patterns = {
                'has_trend': len(datetime_col.unique()) > 10,
                'business_days_only': False,  # Simplified
                'regular_intervals': pd.infer_freq(datetime_col.sort_values()) is not None
            }
            return patterns
        except:
            return {'analysis_error': True}
    
    def _check_numeric_strings(self, column_data):
        """Check if categorical column contains numeric strings"""
        try:
            # Try to convert to numeric and see how many succeed
            numeric_conversion = pd.to_numeric(column_data, errors='coerce')
            numeric_ratio = numeric_conversion.notna().sum() / len(column_data)
            return numeric_ratio > 0.8
        except:
            return False
    
    def _analyze_relationships(self, data):
        """Analyze relationships between variables"""
        relationships = {
            'correlation_analysis': None,
            'high_correlations': [],
            'potential_multicollinearity': False
        }
        
        # Analyze numeric correlations
        numeric_data = data.select_dtypes(include=[np.number])
        if len(numeric_data.columns) > 1:
            correlation_matrix = numeric_data.corr()
            relationships['correlation_analysis'] = correlation_matrix
            
            # Find high correlations
            high_corr_pairs = []
            for i in range(len(correlation_matrix.columns)):
                for j in range(i+1, len(correlation_matrix.columns)):
                    corr_value = correlation_matrix.iloc[i, j]
                    if abs(corr_value) > 0.8:
                        high_corr_pairs.append({
                            'feature1': correlation_matrix.columns[i],
                            'feature2': correlation_matrix.columns[j],
                            'correlation': corr_value
                        })
            
            relationships['high_correlations'] = high_corr_pairs
            relationships['potential_multicollinearity'] = len(high_corr_pairs) > 0
        
        return relationships
    
    def _check_temporal_patterns(self, data):
        """Check for temporal patterns in the data"""
        temporal_analysis = {
            'has_datetime_columns': False,
            'datetime_columns': [],
            'potential_time_series': False,
            'temporal_features': []
        }
        
        # Check for datetime columns
        datetime_columns = []
        for column in data.columns:
            if pd.api.types.is_datetime64_any_dtype(data[column]):
                datetime_columns.append(column)
            else:
                # Check if string column can be converted to datetime
                try:
                    pd.to_datetime(data[column].head(100), errors='raise')
                    datetime_columns.append(column)
                except:
                    pass
        
        temporal_analysis['has_datetime_columns'] = len(datetime_columns) > 0
        temporal_analysis['datetime_columns'] = datetime_columns
        temporal_analysis['potential_time_series'] = len(datetime_columns) > 0 and len(data) > 50
        
        return temporal_analysis
    
    def _assess_target_suitability(self, column_data, column_analysis):
        """Assess if a column is suitable as a target variable using classification rules"""
        
        suitability = {
            'score': 0.0,
            'problem_type': None,
            'reasons': []
        }
        
        rules = self.classification_rules['target_detection']
        quality_thresholds = self.classification_rules['data_quality_thresholds']
        
        # Rule out unsuitable columns
        if column_analysis['is_constant']:
            suitability['reasons'].append('Column is constant')
            return suitability
        
        if column_analysis['missing_ratio'] > quality_thresholds['max_missing_ratio']:
            suitability['reasons'].append('Too many missing values')
            return suitability
        
        # Assess based on data type and characteristics
        if pd.api.types.is_numeric_dtype(column_data):
            unique_count = column_analysis['unique_count']
            unique_ratio = column_analysis['unique_ratio']
            
            # Binary classification check
            if unique_count == rules['binary_classification']['unique_values']:
                suitability['score'] = 0.9
                suitability['problem_type'] = 'binary_classification'
                suitability['reasons'].append('Perfect binary variable')
            
            # Multiclass classification check
            elif (rules['multiclass_classification']['unique_values_range'][0] <= 
                  unique_count <= 
                  rules['multiclass_classification']['unique_values_range'][1]):
                if unique_ratio <= rules['multiclass_classification']['max_unique_ratio']:
                    suitability['score'] = 0.8
                    suitability['problem_type'] = 'multiclass_classification'
                    suitability['reasons'].append('Good multiclass classification candidate')
            
            # Regression check
            elif (unique_ratio >= rules['regression']['min_unique_ratio'] and 
                  unique_count >= rules['regression']['min_unique_values']):
                suitability['score'] = 0.7
                suitability['problem_type'] = 'regression'
                suitability['reasons'].append('Good regression target candidate')
        
        else:  # Categorical data
            unique_count = column_analysis['unique_count']
            
            if (rules['multiclass_classification']['unique_values_range'][0] <= 
                unique_count <= 
                rules['multiclass_classification']['unique_values_range'][1]):
                suitability['score'] = 0.75
                suitability['problem_type'] = 'classification'
                suitability['reasons'].append('Good categorical classification target')
        
        return suitability
    
    def _detect_potential_targets(self, data):
        """Detect potential target variables and recommend ML approach"""
        
        target_candidates = []
        
        # Analyze each column as potential target
        for column in data.columns:
            column_analysis = self._analyze_each_column(data[[column]])[column]
            target_suitability = column_analysis['target_suitability']
            
            if target_suitability['score'] > 0.5:
                target_candidates.append({
                    'column': column,
                    'score': target_suitability['score'],
                    'problem_type': target_suitability['problem_type'],
                    'reasons': target_suitability['reasons']
                })
        
        # Sort by suitability score
        target_candidates.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            'candidates': target_candidates,
            'best_candidate': target_candidates[0] if target_candidates else None,
            'has_suitable_targets': len(target_candidates) > 0
        }
    
    def _generate_comprehensive_recommendations(self, analysis):
        """Generate comprehensive ML recommendations"""
        
        recommendations = {
            'primary_approach': None,
            'alternative_approaches': [],
            'specific_methods': [],
            'preprocessing_requirements': [],
            'tool_recommendations': [],
            'expected_challenges': []
        }
        
        target_detection = analysis['target_detection']
        
        if target_detection['has_suitable_targets']:
            # Supervised learning
            best_target = target_detection['best_candidate']
            recommendations['primary_approach'] = 'supervised_learning'
            recommendations['target_column'] = best_target['column']
            recommendations['problem_type'] = best_target['problem_type']
            
            # Specific method recommendations
            if best_target['problem_type'] == 'regression':
                recommendations['specific_methods'] = [
                    'Random Forest Regression',
                    'Gradient Boosting Regression',
                    'XGBoost Regression',
                    'Linear Regression (baseline)'
                ]
                recommendations['tool_recommendations'] = [
                    'scikit-learn', 'xgboost', 'lightgbm'
                ]
            
            elif 'classification' in best_target['problem_type']:
                recommendations['specific_methods'] = [
                    'Random Forest Classification',
                    'Gradient Boosting Classification',
                    'XGBoost Classification',
                    'Logistic Regression (baseline)'
                ]
                recommendations['tool_recommendations'] = [
                    'scikit-learn', 'xgboost', 'imbalanced-learn'
                ]
        
        else:
            # Unsupervised learning
            recommendations['primary_approach'] = 'unsupervised_learning'
            recommendations['alternative_approaches'] = [
                'clustering', 'anomaly_detection', 'dimensionality_reduction'
            ]
            recommendations['specific_methods'] = [
                'K-Means Clustering',
                'Hierarchical Clustering',
                'DBSCAN',
                'PCA',
                'Isolation Forest'
            ]
            recommendations['tool_recommendations'] = [
                'scikit-learn', 'pandas', 'plotly'
            ]
        
        # Add preprocessing requirements
        recommendations['preprocessing_requirements'] = self._determine_preprocessing_needs(analysis)
        
        # Add expected challenges
        recommendations['expected_challenges'] = self._identify_potential_challenges(analysis)
        
        return recommendations
    
    def _determine_preprocessing_needs(self, analysis):
        """Determine required preprocessing steps"""
        preprocessing = []
        
        basic_stats = analysis['basic_stats']
        
        if basic_stats['missing_data']['missing_ratio'] > 0:
            preprocessing.append('Handle missing values')
        
        if basic_stats['duplicate_rows'] > 0:
            preprocessing.append('Remove duplicate rows')
        
        # Check for categorical encoding needs
        categorical_columns = [col for col, info in analysis['column_analysis'].items() 
                             if not pd.api.types.is_numeric_dtype(pd.Series([], dtype=info['dtype']))]
        
        if categorical_columns:
            preprocessing.append('Encode categorical variables')
        
        # Check for scaling needs
        numeric_columns = [col for col, info in analysis['column_analysis'].items() 
                          if pd.api.types.is_numeric_dtype(pd.Series([], dtype=info['dtype']))]
        
        if len(numeric_columns) > 1:
            preprocessing.append('Feature scaling/normalization')
        
        # Check for outliers
        outlier_columns = [col for col, info in analysis['column_analysis'].items()
                          if 'skewness' in info and abs(info.get('skewness', 0)) > 2]
        
        if outlier_columns:
            preprocessing.append('Handle outliers')
        
        return preprocessing
    
    def _identify_potential_challenges(self, analysis):
        """Identify potential challenges in the dataset"""
        challenges = []
        
        basic_stats = analysis['basic_stats']
        complexity_thresholds = self.classification_rules['complexity_indicators']
        
        # High dimensionality
        if basic_stats['shape'][1] > complexity_thresholds['high_dimensionality_threshold']:
            challenges.append('High dimensionality - consider feature selection')
        
        # Large dataset
        if basic_stats['shape'][0] > complexity_thresholds['large_dataset_threshold']:
            challenges.append('Large dataset - consider sampling or distributed computing')
        
        # High missing data
        if basic_stats['missing_data']['missing_ratio'] > 0.3:
            challenges.append('High missing data ratio - careful imputation needed')
        
        # Imbalanced classes (if classification)
        target_detection = analysis['target_detection']
        if target_detection['has_suitable_targets']:
            challenges.append('Check for class imbalance in target variable')
        
        # High cardinality categorical variables
        high_cardinality_cols = [col for col, info in analysis['column_analysis'].items()
                               if info.get('is_high_cardinality', False)]
        
        if high_cardinality_cols:
            challenges.append('High cardinality categorical variables - consider encoding strategies')
        
        return challenges
    
    def _calculate_confidence_scores(self, analysis, recommendations):
        """Calculate confidence scores for recommendations"""
        
        confidence_scores = {
            'overall_confidence': 0.0,
            'data_quality_score': 0.0,
            'target_detection_confidence': 0.0,
            'recommendation_reliability': 0.0
        }
        
        # Data quality score
        basic_stats = analysis['basic_stats']
        quality_factors = []
        
        # Missing data factor
        missing_ratio = basic_stats['missing_data']['missing_ratio']
        quality_factors.append(max(0, 1 - missing_ratio * 2))
        
        # Duplicate data factor
        duplicate_ratio = basic_stats['duplicate_rows'] / basic_stats['shape'][0]
        quality_factors.append(max(0, 1 - duplicate_ratio * 3))
        
        # Constant features factor
        constant_features = sum(1 for info in analysis['column_analysis'].values() 
                              if info['is_constant'])
        constant_ratio = constant_features / basic_stats['shape'][1]
        quality_factors.append(max(0, 1 - constant_ratio * 2))
        
        confidence_scores['data_quality_score'] = np.mean(quality_factors)
        
        # Target detection confidence
        if analysis['target_detection']['has_suitable_targets']:
            best_target = analysis['target_detection']['best_candidate']
            confidence_scores['target_detection_confidence'] = best_target['score']
        else:
            confidence_scores['target_detection_confidence'] = 0.7  # Default for unsupervised
        
        # Recommendation reliability
        if recommendations['primary_approach'] == 'supervised_learning':
            confidence_scores['recommendation_reliability'] = confidence_scores['target_detection_confidence']
        else:
            confidence_scores['recommendation_reliability'] = 0.6  # Conservative for unsupervised
        
        # Overall confidence
        confidence_scores['overall_confidence'] = np.mean([
            confidence_scores['data_quality_score'],
            confidence_scores['target_detection_confidence'],
            confidence_scores['recommendation_reliability']
        ])
        
        return confidence_scores

# Usage example
def analyze_unknown_data(data):
    """Complete analysis of unknown dataset"""
    
    # Initialize classifier
    classifier = UniversalDataClassifier()
    
    # Perform analysis
    results = classifier.classify_data(data)
    
    # Print recommendations
    print("=== DATA ANALYSIS RESULTS ===")
    print(f"Dataset shape: {results['analysis']['basic_stats']['shape']}")
    print(f"Primary approach: {results['recommendations']['primary_approach']}")
    
    if results['recommendations']['primary_approach'] == 'supervised_learning':
        print(f"Recommended target: {results['recommendations']['target_column']}")
        print(f"Problem type: {results['recommendations']['problem_type']}")
    
    print(f"Recommended methods: {results['recommendations']['specific_methods']}")
    print(f"Recommended tools: {results['recommendations']['tool_recommendations']}")
    print(f"Preprocessing needed: {results['recommendations']['preprocessing_requirements']}")
    print(f"Overall confidence: {results['confidence_scores']['overall_confidence']:.2f}")
    
    return results

# Test the corrected code
if __name__ == "__main__":
    # Create sample data for testing
    import pandas as pd
    import numpy as np
    
    # Example with supervised learning scenario
    np.random.seed(42)
    sample_data = pd.DataFrame({
        'feature1': np.random.normal(0, 1, 1000),
        'feature2': np.random.uniform(0, 100, 1000),
        'category': np.random.choice(['A', 'B', 'C'], 1000),
        'target': np.random.choice([0, 1], 1000)  # Binary target
    })
    
    results = analyze_unknown_data(sample_data)